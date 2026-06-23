import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  Building2Icon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  CreditCardIcon,
  LandmarkIcon,
  Loader2Icon,
  LockIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  XCircleIcon,
} from 'lucide-react';
import { formatVND } from '../../utils/format';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const TEST_CARD = {
  bank: 'NCB',
  cardNumber: '9704198526191432198',
  cardholder: 'NGUYEN VAN A',
  issueDate: '07/15',
  otp: '123456',
};

const VNPAY_LOGO = '/payment-logos/vnpay-qr.svg';
const QR_SIZE = 29;

const BANKS = [
  { code: 'NCB', name: 'Ngân hàng NCB', logo: '/payment-logos/ncb.svg' },
  { code: 'VCB', name: 'Vietcombank', logo: '/payment-logos/vcb.svg' },
  { code: 'TCB', name: 'Techcombank', logo: '/payment-logos/tcb.svg' },
  { code: 'BIDV', name: 'BIDV', logo: '/payment-logos/bidv.svg' },
];

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
    const seed = hashString(value || 'vnpay-demo');
    return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
      const row = Math.floor(index / QR_SIZE);
      const col = index % QR_SIZE;
      const finder = isFinderCell(row, col);
      if (finder !== null) return finder;
      if ((row * 5 + col + seed) % 19 === 0 || (row + col * 2) % 23 === 0) return false;
      return ((row * 37 + col * 13 + seed) % 8) < 3;
    });
  }, [value]);

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[252px] grid-cols-[repeat(29,minmax(0,1fr))] gap-[2px] rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      {cells.map((active, index) => (
        <span
          key={index}
          className={active ? 'rounded-[1px] bg-slate-950' : 'rounded-[1px] bg-transparent'}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px] bg-white shadow">
        <img src={VNPAY_LOGO} alt="VNPay" className="h-9 w-9 object-contain" />
      </div>
    </div>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export function VNPayDemoPayment() {
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState(TEST_CARD.bank);
  const [cardNumber, setCardNumber] = useState(TEST_CARD.cardNumber);
  const [cardholder, setCardholder] = useState(TEST_CARD.cardholder);
  const [issueDate, setIssueDate] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'card' | 'otp'>('card');
  const [submitting, setSubmitting] = useState<'success' | 'failed' | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const txnRef = params.get('txnRef') || '';
  const orderInfo = params.get('orderInfo') || 'Thanh toán đơn hàng';
  const amount = Number(params.get('amount') || 0);
  const selectedBankInfo = BANKS.find((bank) => bank.code === selectedBank) || BANKS[0];
  const qrValue = useMemo(
    () => `VNPAY|${txnRef || 'DEMO'}|${amount || 0}|${orderInfo}|${settings.siteName}`,
    [amount, orderInfo, txnRef, settings.siteName],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const copyTxnRef = async () => {
    if (!txnRef) return;
    try {
      await navigator.clipboard.writeText(txnRef);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const completePayment = async (success: boolean) => {
    if (!txnRef) {
      setError('Thiếu mã giao dịch VNPay demo.');
      return;
    }

    setError('');
    setSubmitting(success ? 'success' : 'failed');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/vnpay_demo_result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txnRef, success }),
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

  const handleContinue = () => {
    const normalizedCard = cardNumber.replace(/\s/g, '');
    const normalizedName = cardholder.trim().toUpperCase();

    if (selectedBank !== TEST_CARD.bank) {
      setError('Demo chỉ hỗ trợ thẻ test của ngân hàng NCB.');
      return;
    }
    if (normalizedCard !== TEST_CARD.cardNumber) {
      setError('Số thẻ test không đúng.');
      return;
    }
    if (normalizedName !== TEST_CARD.cardholder) {
      setError('Tên chủ thẻ test không đúng.');
      return;
    }
    if (issueDate.trim() !== TEST_CARD.issueDate) {
      setError('Ngày phát hành test phải là 07/15.');
      return;
    }

    setError('');
    setStep('otp');
  };

  const handleConfirmOtp = () => {
    if (otp.trim() !== TEST_CARD.otp) {
      setError('OTP test không đúng.');
      return;
    }
    completePayment(true);
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại
          </button>
          <div className="flex items-center gap-3 rounded-[8px] bg-white px-4 py-2.5 shadow-sm">
            <img src={VNPAY_LOGO} alt="VNPay" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black text-[#005baa]">VNPay Demo</span>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-4">
          <section className="w-full overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-xl">
            <div className="flex flex-col gap-4 bg-[#005baa] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white">
                  <img src={VNPAY_LOGO} alt="VNPay" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-white/80">Cổng thanh toán giả lập</p>
                  <h1 className="text-xl font-black sm:text-2xl">Thanh toán qua VNPay</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[8px] bg-white/12 px-3 py-2 text-sm font-bold">
                <ClockIcon className="h-4 w-4" />
                Giao dịch hết hạn sau {formatTimer(remainingSeconds)}
              </div>
            </div>

            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)_380px]">
              <aside className="border-b border-slate-200 bg-slate-50 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex rounded-[8px] border border-slate-200 bg-white p-1 text-sm font-black">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#005baa] px-3 py-2 text-white">
                    <QrCodeIcon className="h-4 w-4" />
                    QR Pay
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-[6px] px-3 py-2 text-slate-500">
                    <CreditCardIcon className="h-4 w-4" />
                    Thẻ
                  </button>
                </div>

                <div className="rounded-[8px] border border-slate-200 bg-white p-5 text-center">
                  <p className="mb-3 text-sm font-bold text-slate-600">Quét mã bằng ứng dụng ngân hàng</p>
                  <DemoQrCode value={qrValue} />
                  <div className="mt-4 rounded-[8px] bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-[#005baa]">
                    QR chỉ mô phỏng cho demo, không phát sinh giao dịch thật.
                  </div>
                </div>

                <div className="mt-5 rounded-[8px] border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-2">
                    <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#005baa]" />
                    <p className="text-xs font-semibold leading-5 text-slate-700">
                      Môi trường giả lập VNPay. Bạn có thể nhập thẻ test hoặc huỷ giao dịch để mô phỏng phản hồi.
                    </p>
                  </div>
                </div>
              </aside>

              <section className="border-b border-slate-200 bg-white p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="mx-auto max-w-2xl">
                  <div className="mb-6 text-center">
                    <p className="text-sm font-bold text-slate-500">Số tiền thanh toán</p>
                    <p className="mt-2 text-4xl font-black text-[#005baa] sm:text-5xl">
                      {Number.isFinite(amount) ? formatVND(amount) : formatVND(0)}
                    </p>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedBank(bank.code)}
                        className={`rounded-[8px] border px-3 py-3 text-left transition ${
                          selectedBank === bank.code
                            ? 'border-[#005baa] bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <img src={bank.logo} alt={bank.name} className="mb-2 h-8 w-full object-contain" />
                        <span className="block text-center text-xs font-black text-slate-600">{bank.code}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mb-5 flex items-center justify-center border-b-2 border-[#005baa] pb-3 text-sm font-black text-slate-700">
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                    Thanh toán bằng thẻ nội địa
                  </div>

                  {step === 'card' ? (
                    <div className="space-y-4">
                      <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-600">Số thẻ</span>
                        <div className="relative">
                          <input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full rounded-[8px] border border-slate-300 px-4 py-3 pr-28 text-sm font-semibold outline-none focus:border-[#005baa] focus:ring-2 focus:ring-blue-100"
                            placeholder="9704198526191432198"
                          />
                          <img
                            src={selectedBankInfo.logo}
                            alt={selectedBankInfo.name}
                            className="absolute right-3 top-1/2 h-8 w-20 -translate-y-1/2 object-contain"
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-600">Tên chủ thẻ</span>
                        <input
                          value={cardholder}
                          onChange={(e) => setCardholder(e.target.value)}
                          className="w-full rounded-[8px] border border-slate-300 px-4 py-3 text-sm font-semibold uppercase outline-none focus:border-[#005baa] focus:ring-2 focus:ring-blue-100"
                          placeholder="NGUYEN VAN A"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 flex items-center gap-1 text-sm font-bold text-slate-600">
                          Ngày phát hành
                          <ClockIcon className="h-3.5 w-3.5" />
                        </span>
                        <input
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="w-full max-w-[220px] rounded-[8px] border border-slate-300 px-4 py-3 text-sm font-semibold outline-none focus:border-[#005baa] focus:ring-2 focus:ring-blue-100"
                          placeholder="MM/YY"
                        />
                      </label>

                      <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-600">
                        Thẻ test: NCB, số thẻ 9704198526191432198, chủ thẻ NGUYEN VAN A, ngày phát hành 07/15.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-2">
                          <LockIcon className="mt-0.5 h-4 w-4 text-amber-700" />
                          <p className="text-sm font-semibold leading-6 text-amber-900">
                            Nhập mã OTP test <span className="font-black">123456</span> để hoàn tất giao dịch.
                          </p>
                        </div>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-600">Mã OTP</span>
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full rounded-[8px] border border-slate-300 px-4 py-3 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-[#005baa] focus:ring-2 focus:ring-blue-100"
                          placeholder="123456"
                          maxLength={6}
                        />
                      </label>
                    </div>
                  )}

                  {error && (
                    <div className="mt-5 flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      <AlertCircleIcon className="mt-0.5 h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {step === 'card' ? (
                      <button
                        type="button"
                        disabled={remainingSeconds === 0}
                        onClick={handleContinue}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#005baa] px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-[#004b91] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Tiếp tục thanh toán
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting !== null || remainingSeconds === 0}
                        onClick={handleConfirmOtp}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#005baa] px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-[#004b91] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting === 'success' ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <CheckCircleIcon className="h-5 w-5" />}
                        {submitting === 'success' ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={submitting !== null}
                      onClick={() => completePayment(false)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting === 'failed' ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <XCircleIcon className="h-5 w-5" />}
                      {submitting === 'failed' ? 'Đang xử lý...' : 'Huỷ giao dịch'}
                    </button>
                  </div>

                  {remainingSeconds === 0 && (
                    <p className="mt-4 text-center text-sm font-bold text-red-600">
                      Giao dịch đã hết hạn. Vui lòng quay lại checkout và tạo giao dịch mới.
                    </p>
                  )}
                </div>
              </section>

              <aside className="bg-slate-50 p-5 sm:p-7">
                <div className="rounded-[8px] border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="font-black text-slate-900">Thông tin giao dịch</h2>
                  </div>
                  <div className="divide-y divide-slate-100 text-sm">
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Building2Icon className="h-4 w-4" />
                        <span className="font-bold">Đơn vị chấp nhận thanh toán</span>
                      </div>
                      <p className="mt-1 font-black text-slate-900">{settings.siteName}</p>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <LandmarkIcon className="h-4 w-4" />
                        <span className="font-bold">Ngân hàng</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 rounded-[8px] bg-slate-50 p-3">
                        <img src={selectedBankInfo.logo} alt={selectedBankInfo.name} className="h-8 w-20 object-contain" />
                        <span className="font-black text-slate-900">{selectedBankInfo.name}</span>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <p className="font-bold text-slate-500">Mã giao dịch</p>
                      <button
                        type="button"
                        onClick={copyTxnRef}
                        className="mt-2 flex w-full min-w-0 items-center justify-between gap-3 rounded-[8px] bg-slate-50 px-3 py-2 text-left font-mono text-xs font-bold text-slate-900 hover:bg-slate-100"
                      >
                        <span className="min-w-0 break-all">{txnRef || 'N/A'}</span>
                        <CopyIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    </div>
                    <div className="px-5 py-4">
                      <p className="font-bold text-slate-500">Nội dung</p>
                      <p className="mt-1 font-black text-slate-900">{orderInfo}</p>
                    </div>
                    <div className="px-5 py-4">
                      <p className="font-bold text-slate-500">Phí giao dịch</p>
                      <p className="mt-1 font-black text-slate-900">0 VND</p>
                    </div>
                    <div className="px-5 py-4">
                      <p className="font-bold text-slate-500">Tổng thanh toán</p>
                      <p className="mt-1 text-2xl font-black text-[#d71920]">
                        {Number.isFinite(amount) ? formatVND(amount) : formatVND(0)}
                      </p>
                    </div>
                  </div>
                </div>

                {copied && (
                  <div className="mt-4 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    Đã sao chép mã giao dịch.
                  </div>
                )}

                <div className="mt-5 rounded-[8px] border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <SmartphoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#005baa]" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Hướng dẫn mô phỏng</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        Chọn NCB, nhập ngày phát hành 07/15, sau đó dùng OTP 123456 để giả lập thanh toán thành công.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
