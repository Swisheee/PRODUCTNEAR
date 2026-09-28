'use client';
import { useState } from 'react';
import { Search, Link as LinkIcon, PenLine } from 'lucide-react';
import { ActionForm, type Field } from './action-form';
import { publicHttpsUrl } from '@/lib/validation';
import type { Product, Club } from '@/lib/types';
export function GearForm({
  products,
  clubs,
  disabled,
}: {
  products: Product[];
  clubs: Club[];
  disabled: boolean;
}) {
  const [mode, setMode] = useState('search');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState('');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [resolved, setResolved] = useState('');
  const fields: Field[] = [
    ...(!selected
      ? ([
          { name: 'brand', label: '브랜드', required: true, placeholder: '예: Nike' },
          {
            name: 'name',
            label: '제품명',
            required: true,
            placeholder: '예: Kobe 9 Protro Elite Low',
          },
          { name: 'category', label: '카테고리', required: true, placeholder: '예: 농구화' },
        ] as Field[])
      : []),
    {
      name: 'club_id',
      label: '함께 공유할 동호회',
      type: 'select',
      options: [
        { value: '', label: '선택하지 않음' },
        ...clubs.map((c) => ({ value: c.id, label: c.name })),
      ],
    },
    { name: 'size', label: '사이즈', placeholder: '예: 285mm' },
    { name: 'color', label: '색상', placeholder: '예: 화이트' },
    { name: 'usage_start_date', label: '언제부터 사용했나요?', type: 'date' },
    {
      name: 'usage_frequency',
      label: '얼마나 자주 쓰나요?',
      required: true,
      placeholder: '예: 주 2~3회',
    },
    {
      name: 'usage_context',
      label: '주로 어떻게 사용하나요?',
      placeholder: '예: 실내 코트 · 가드 · 주말 경기',
    },
    {
      name: 'review_text',
      label: '써보니 어땠나요?',
      type: 'textarea',
      placeholder: '같이 운동하는 친구에게 알려주고 싶은 경험을 적어주세요.',
    },
    { name: 'pros', label: '좋았던 점', placeholder: '직접 느낀 장점을 알려주세요.' },
    { name: 'cons', label: '아쉬웠던 점' },
    { name: 'recommend_for', label: '이런 사람에게 추천해요' },
    {
      name: 'buy_again',
      label: '다시 살 의향이 있나요?',
      type: 'select',
      options: [
        { value: 'unknown', label: '아직 모르겠어요' },
        { value: 'yes', label: '네, 다시 살래요' },
        { value: 'no', label: '아니요' },
      ],
    },
    {
      name: 'visibility',
      label: '공개 범위',
      type: 'select',
      options: [
        { value: 'public', label: '전체 공개' },
        { value: 'club', label: '선택한 동호회만' },
        { value: 'private', label: '나만 보기' },
      ],
    },
  ];
  return (
    <>
      <div className="tabs">
        <button
          className={mode === 'search' ? 'active' : ''}
          onClick={() => {
            setMode('search');
            setSelected('');
          }}
        >
          <Search size={16} />
          제품 검색
        </button>
        <button
          className={mode === 'url' ? 'active' : ''}
          onClick={() => {
            setMode('url');
            setSelected('');
          }}
        >
          <LinkIcon size={16} />
          구매 링크
        </button>
        <button
          className={mode === 'manual' ? 'active' : ''}
          onClick={() => {
            setMode('manual');
            setSelected('');
          }}
        >
          <PenLine size={16} />
          직접 입력
        </button>
      </div>
      {mode === 'search' && (
        <div className="search-select">
          <label className="field">
            <span>브랜드 또는 제품명</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="어떤 장비를 쓰고 있나요?"
            />
          </label>
          <div className="product-options">
            {products
              .filter((p) => (p.brand + ' ' + p.name).toLowerCase().includes(q.toLowerCase()))
              .slice(0, 12)
              .map((p) => (
                <button
                  key={p.id}
                  className={selected === p.id ? 'selected' : ''}
                  onClick={() => setSelected(p.id)}
                >
                  <small>{p.brand}</small>
                  {p.name}
                  {selected === p.id && <span>선택됨 ✓</span>}
                </button>
              ))}
          </div>
          <p className="muted">
            같은 제품은 기존 항목을 선택해주세요. 찾는 제품이 없으면 직접 입력할 수 있어요.
          </p>
        </div>
      )}
      {mode === 'url' && (
        <div className="panel">
          <label className="field">
            <span>구매한 쇼핑몰 주소</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <button
            className="button secondary"
            onClick={() => {
              try {
                const safe = publicHttpsUrl(url);
                setResolved(safe);
                setUrlError('');
              } catch {
                setResolved('');
                setUrlError('공개 쇼핑몰의 HTTPS 주소를 입력해주세요.');
              }
            }}
          >
            주소 확인
          </button>
          {urlError && (
            <p role="alert" className="form-error">
              {urlError}
            </p>
          )}
          {resolved && (
            <p className="form-success">
              {new URL(resolved).hostname} 주소를 확인했어요. 자동 정보 연동은 준비 중이므로 제품
              정보를 직접 입력해주세요.
            </p>
          )}
        </div>
      )}
      <ActionForm
        key={selected + mode + resolved}
        kind="gear"
        fields={fields}
        hidden={{ product_id: selected, purchase_url: mode === 'url' ? resolved : '' }}
        submit="내 장비 등록하기"
        disabled={disabled || (mode === 'url' && !resolved)}
      />
    </>
  );
}
