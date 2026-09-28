export type Profile = {
  id: string;
  nickname: string;
  sports: string[];
  main_sport: string | null;
  region: string | null;
  experience_level: string | null;
  is_demo: boolean;
  onboarding_completed: boolean;
};
export type Club = {
  id: string;
  name: string;
  sport: string;
  region: string | null;
  description: string;
  visibility: 'public' | 'private';
  join_policy: 'open' | 'approval' | 'invite';
  owner_id: string;
  is_demo: boolean;
};
export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  description: string;
  primary_image: string | null;
};
export type Gear = {
  id: string;
  user_id: string;
  product_id: string;
  club_id: string | null;
  size: string | null;
  color: string | null;
  usage_start_date: string | null;
  usage_frequency: string | null;
  usage_context: string | null;
  review_text: string | null;
  pros: string | null;
  cons: string | null;
  buy_again: boolean | null;
  recommend_for: string | null;
  visibility: string;
  created_at: string;
  profiles: Profile;
  products: Product;
  clubs: Club | null;
};
export type Question = {
  id: string;
  product_id: string;
  author_id: string;
  question: string;
  created_at: string;
  profiles: Profile;
  target_user_id: string | null;
  club_id: string | null;
};
export type Answer = {
  id: string;
  answer: string;
  author_id: string;
  profiles: Profile;
  created_at: string;
};
export type Offer = {
  id: string;
  product_id: string;
  product_url: string;
  affiliate_url: string | null;
  price: number | null;
  shipping_fee: number | null;
  availability: string;
  last_checked_at: string | null;
  merchants: {
    id: string;
    name: string;
    affiliate_enabled: boolean;
    status: string;
    provider: string;
  };
};
export type Member = {
  user_id: string;
  club_id: string;
  role: string;
  status: string;
  profiles: Profile;
};
export type Notice = {
  id: string;
  message: string;
  href: string;
  read_at: string | null;
  created_at: string;
};
