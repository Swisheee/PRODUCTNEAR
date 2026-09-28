import { publicHttpsUrl } from '../validation';
export type ProviderState = 'READY' | 'NOT_CONFIGURED' | 'NOT_IMPLEMENTED' | 'GENERIC_URL_ONLY';
export type AffiliateContext = { clickId: string; productId: string; clubId?: string };
export type ResolvedProduct = {
  url: string;
  domain: string;
  status: 'manual_confirmation_required';
  name?: string;
};
export type Conversion = {
  orderReference: string;
  clickId?: string;
  revenue: number;
  commission: number;
  currency: string;
  status: 'pending' | 'approved' | 'cancelled' | 'refunded';
};
export interface CommerceProvider {
  id: string;
  name: string;
  status: ProviderState;
  canHandleUrl(url: string): boolean;
  resolveProductUrl?(url: string): Promise<ResolvedProduct>;
  createAffiliateLink?(
    url: string,
    context: AffiliateContext,
  ): Promise<{ url: string; affiliate: boolean; reason?: string }>;
  verifyWebhook?(request: Request): Promise<boolean>;
  parseConversionWebhook?(request: Request): Promise<Conversion[]>;
}
export class GenericUrlProvider implements CommerceProvider {
  id = 'generic';
  name = '일반 쇼핑몰';
  status: ProviderState = 'GENERIC_URL_ONLY';
  canHandleUrl(url: string) {
    try {
      publicHttpsUrl(url);
      return true;
    } catch {
      return false;
    }
  }
  async resolveProductUrl(url: string): Promise<ResolvedProduct> {
    const safe = publicHttpsUrl(url);
    return { url: safe, domain: new URL(safe).hostname, status: 'manual_confirmation_required' };
  }
  async createAffiliateLink(
    url: string,
  ): Promise<{ url: string; affiliate: boolean; reason?: string }> {
    return { url: publicHttpsUrl(url), affiliate: false };
  }
}
// Deliberately disabled scaffolds until the approved provider API contract is implemented.
// A credential's presence alone must never imply a working API integration.
export class CoupangProvider extends GenericUrlProvider {
  id = 'coupang';
  name = '쿠팡 파트너스';
  status: ProviderState;
  constructor(configured = false) {
    super();
    this.status = configured ? 'NOT_IMPLEMENTED' : 'NOT_CONFIGURED';
  }
  canHandleUrl(url: string) {
    try {
      const h = new URL(publicHttpsUrl(url)).hostname;
      return h === 'coupang.com' || h.endsWith('.coupang.com');
    } catch {
      return false;
    }
  }
  async createAffiliateLink(url: string) {
    return { url: publicHttpsUrl(url), affiliate: false, reason: this.status };
  }
}
export class LinkPriceProvider extends GenericUrlProvider {
  id = 'linkprice';
  name = '링크프라이스';
  status: ProviderState;
  constructor(configured = false) {
    super();
    this.status = configured ? 'NOT_IMPLEMENTED' : 'NOT_CONFIGURED';
  }
  canHandleUrl() {
    return false;
  }
  async createAffiliateLink(url: string) {
    return { url: publicHttpsUrl(url), affiliate: false, reason: this.status };
  }
}
export class DirectMerchantProvider extends GenericUrlProvider {
  id = 'direct';
  name = '직접 계약 판매처';
  status: ProviderState = 'NOT_CONFIGURED';
  constructor(private config?: { domain: string; parameter: string; merchantId: string }) {
    super();
    if (config) this.status = 'READY';
  }
  canHandleUrl(url: string) {
    return Boolean(this.config && new URL(publicHttpsUrl(url)).hostname === this.config.domain);
  }
  async createAffiliateLink(url: string, context?: AffiliateContext) {
    const safe = publicHttpsUrl(url);
    if (!this.config || !context || !this.canHandleUrl(safe))
      return { url: safe, affiliate: false };
    const dest = new URL(safe);
    dest.searchParams.set(this.config.parameter, context.clickId);
    return { url: dest.toString(), affiliate: true };
  }
}
export class CommerceProviderRegistry {
  private providers: CommerceProvider[] = [];
  register(provider: CommerceProvider) {
    if (this.providers.some((p) => p.id === provider.id))
      throw new Error('Duplicate commerce provider');
    this.providers.push(provider);
    return this;
  }
  resolve(url: string) {
    publicHttpsUrl(url);
    return (
      this.providers.find((p) => p.id !== 'generic' && p.canHandleUrl(url)) ||
      this.providers.find((p) => p.id === 'generic')!
    );
  }
  list() {
    return this.providers.map(({ id, name, status }) => ({ id, name, status }));
  }
}
export function registry() {
  return new CommerceProviderRegistry()
    .register(
      new CoupangProvider(
        Boolean(process.env.COUPANG_ACCESS_KEY && process.env.COUPANG_SECRET_KEY),
      ),
    )
    .register(new LinkPriceProvider(Boolean(process.env.LINKPRICE_API_KEY)))
    .register(new DirectMerchantProvider())
    .register(new GenericUrlProvider());
}
