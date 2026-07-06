interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="pointer-events-auto rounded-lg bg-card px-4 py-3 text-sm text-ink shadow-overlay">
      {message}
    </div>
  );
}
