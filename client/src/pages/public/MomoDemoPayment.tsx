import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  InfoIcon,
  Loader2Icon,
  ShieldCheckIcon,
  SmartphoneIcon,
  WalletIcon,
  XCircleIcon,
} from 'lucide-react';
import { formatVND } from '../../utils/format';

const QR_SIZE = 29;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isFinderCell(row: number, col: number) {
  const inBox = (startRow: number, startCol: number) =>
    row >= startRow && row < startRow + 7 && col >= startCol && col < startCol + 7;
  const isRing = (startRow: number, startCol: number) =>
    row === startRow ||
    row === startRow + 6 ||
    col === startCol ||
    col === startCol + 6 ||
    (row >= startRow + 2 && row <= startRow + 4 && col >= startCol + 2 && col <= startCol + 4);

  if (inBox(1, 1)) return isRing(1, 1);
  if (inBox(1, QR_SIZE - 8)) return isRing(1, QR_SIZE - 8);
  if (inBox(QR_SIZE - 8, 1)) return isRing(QR_SIZE - 8, 1);
  return null;
}

function DemoQrCode({ value }: { value: string }) {
  const cells = useMemo(() => {
    const seed = hashString(value || 'momo-demo');
    return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
      const row = Math.floor(index / QR_SIZE);
      const col = index % QR_SIZE;
      const finder = isFinderCell(row, col);
      if (finder !== null) return finder;
      if ((row + col) % 13 === 0 || (row * 3 + col + seed) % 17 === 0) return false;
      return ((row * 31 + col * 17 + seed) % 7) < 3;
    });
  }, [value]);

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[270px] grid-cols-[repeat(29,minmax(0,1fr))] gap-[2px] rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      {cells.map((active, index) => (
        <span
          key={index}
          className={active ? 'rounded-[1px] bg-slate-950' : 'rounded-[1px] bg-transparent'}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px] bg-white shadow">
        <span className="text-xl font-black text-[#a50064]">M</span>
      </div>
    </div>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export function MomoDemoPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<'success' | 'failed' | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'order' | 'request' | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(10 * 60);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderId = params.get('orderId') || '';
  const requestId = params.get('requestId') || '';
  const orderInfo = params.get('orderInfo') || 'Thanh toán đơn hàng';
  const amount = Number(params.get('amount') || 0);
  const paymentCode = useMemo(
    () => `MOMO|${orderId || 'DEMO'}|${requestId || 'REQUEST'}|${amount || 0}`,
    [amount, orderId, requestId],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const copyValue = async (type: 'order' | 'request', value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  const completePayment = async (success: boolean) => {
    if (!orderId) {
      setError('Thiếu mã giao dịch MoMo demo.');
      return;
    }

    setError('');
    setSubmitting(success ? 'success' : 'failed');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/momo_demo_result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, success }),
      });
      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.message || 'Không thể cập nhật kết quả thanh toán demo.');
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật kết quả thanh toán demo.');
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
          <div className="flex items-center gap-2 rounded-[8px] bg-[#a50064] px-4 py-2.5 text-sm font-black text-white shadow-sm">
            <WalletIcon className="h-4 w-4" />
            MoMo Demo
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-4">
          <section className="w-full overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#a50064] px-5 py-4 text-white sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white/15">
                  <SmartphoneIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-white/80">Cổng thanh toán giả lập</p>
                  <h1 className="text-xl font-black sm:text-2xl">Thanh toán qua MoMo</h1>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-[8px] bg-white/12 px-3 py-2 text-sm font-bold sm:flex">
                <ClockIcon className="h-4 w-4" />
                {formatTimer(remainingSeconds)}
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-slate-200 bg-white p-5 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="mx-auto max-w-sm text-center">
                  <p className="mb-3 text-sm font-bold text-slate-600">Quét mã để thanh toán</p>
                  <DemoQrCode value={paymentCode} />
                  <div className="mt-5 rounded-[8px] border border-[#f2cfe2] bg-[#fff5fa] p-4 text-left">
                    <div className="flex items-start gap-3">
                      <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#a50064]" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Mở ứng dụng MoMo và quét mã QR</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Đây là màn hình demo. QR chỉ mô phỏng thông tin thanh toán, không trừ tiền thật và không gọi hệ thống MoMo thật.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#a50064] sm:hidden">
                    <ClockIcon className="h-4 w-4" />
                    Mã hết hạn sau {formatTimer(remainingSeconds)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 sm:p-8">
                <div className="mb-6 rounded-[8px] bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-500">Số tiền cần thanh toán</p>
                  <p className="mt-2 text-4xl font-black text-[#a50064] sm:text-5xl">
                    {Number.isFinite(amount) ? formatVND(amount) : formatVND(0)}
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Giao dịch demo an toàn cho môi trường đồ án
                  </div>
                </div>

                <div className="rounded-[8px] border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="font-black text-slate-900">Thông tin thanh toán</h2>
                  </div>
                  <div className="divide-y divide-slate-100 text-sm">
                    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]">
                      <span className="font-bold text-slate-500">Nhà cung cấp</span>
                      <span className="font-black text-slate-900">ShopHub Electronics</span>
                    </div>
                    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]">
                      <span className="font-bold text-slate-500">Nội dung</span>
                      <span className="font-black text-slate-900">{orderInfo}</span>
                    </div>
                    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[150px_1fr]">
                      <span className="font-bold text-slate-500">Mã giao dịch</span>
                      <button
                        type="button"
                        onClick={() => copyValue('order', orderId)}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-[8px] bg-slate-50 px-3 py-2 text-left font-mono text-xs font-bold text-slate-900 hover:bg-slate-100"
                      >
                        <span className="min-w-0 break-all">{orderId || 'N/A'}</span>
                        <CopyIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    </div>
                    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[150px_1fr]">
                      <span className="font-bold text-slate-500">Request ID</span>
                      <button
                        type="button"
                        onClick={() => copyValue('request', requestId)}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-[8px] bg-slate-50 px-3 py-2 text-left font-mono text-xs font-bold text-slate-900 hover:bg-slate-100"
                      >
                        <span className="min-w-0 break-all">{requestId || 'N/A'}</span>
                        <CopyIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {copied && (
                  <div className="mt-4 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    Đã sao chép {copied === 'order' ? 'mã giao dịch' : 'Request ID'}.
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={submitting !== null || remainingSeconds === 0}
                    onClick={() => completePayment(true)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting === 'success' ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <CheckCircleIcon className="h-5 w-5" />}
                    {submitting === 'success' ? 'Đang xử lý...' : 'Xác nhận thành công'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting !== null}
                    onClick={() => completePayment(false)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting === 'failed' ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <XCircleIcon className="h-5 w-5" />}
                    {submitting === 'failed' ? 'Đang xử lý...' : 'Huỷ thanh toán'}
                  </button>
                </div>

                {remainingSeconds === 0 && (
                  <p className="mt-4 text-center text-sm font-bold text-red-600">
                    Mã QR đã hết hạn. Vui lòng quay lại checkout và tạo giao dịch mới.
                  </p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
