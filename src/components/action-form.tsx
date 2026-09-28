'use client';
import { useActionState } from 'react';
import { mutate, type ActionState } from '@/lib/actions';
import { LoaderCircle, Share2 } from 'lucide-react';
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'date' | 'url' | 'file' | 'select';
  required?: boolean;
  placeholder?: string;
  value?: string;
  options?: { value: string; label: string }[];
  hint?: string;
};
export function ActionForm({
  kind,
  fields = [],
  hidden = {},
  submit = '저장하기',
  disabled = false,
  compact = false,
}: {
  kind: string;
  fields?: Field[];
  hidden?: Record<string, string>;
  submit?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(mutate, {});
  return (
    <form action={action} className={compact ? 'action-form compact' : 'action-form'}>
      <input type="hidden" name="kind" value={kind} />
      {Object.entries(hidden).map(([k, v]) => (
        <input type="hidden" name={k} value={v} key={k} />
      ))}
      {fields.map((f) => (
        <label className="field" key={f.name}>
          <span>
            {f.label}
            {f.required && <b aria-hidden="true"> *</b>}
          </span>
          {f.type === 'select' ? (
            <select
              name={f.name}
              defaultValue={f.value || ''}
              required={f.required}
              disabled={pending || disabled}
            >
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              name={f.name}
              defaultValue={f.value}
              placeholder={f.placeholder}
              rows={4}
              required={f.required}
              maxLength={4000}
              disabled={pending || disabled}
            />
          ) : (
            <input
              name={f.name}
              type={f.type || 'text'}
              defaultValue={f.type === 'file' ? undefined : f.value}
              placeholder={f.placeholder}
              required={f.required}
              accept={f.type === 'file' ? 'image/jpeg,image/png,image/webp' : undefined}
              autoComplete={
                f.type === 'password'
                  ? kind === 'signup'
                    ? 'new-password'
                    : 'current-password'
                  : f.type === 'email'
                    ? 'email'
                    : undefined
              }
              disabled={pending || disabled}
            />
          )}
          {f.hint && <small>{f.hint}</small>}
        </label>
      ))}
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-success" role="status">
          {state.success}
        </p>
      )}
      {state.url && (
        <div className="share-box">
          <label>
            초대 링크
            <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} />
          </label>
          <button
            type="button"
            className="button secondary"
            onClick={async () => {
              try {
                if (navigator.share)
                  await navigator.share({ title: '써본사람 동호회 초대', url: state.url });
                else await navigator.clipboard.writeText(state.url!);
              } catch {
                /* The URL remains selectable if sharing is cancelled. */
              }
            }}
          >
            <Share2 size={16} /> 링크 공유·복사
          </button>
        </div>
      )}
      <button className="button" disabled={pending || disabled} type="submit">
        {pending && <LoaderCircle size={16} className="spin" />}
        {pending ? '처리 중…' : submit}
      </button>
    </form>
  );
}
