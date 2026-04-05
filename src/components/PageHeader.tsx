interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end gap-3 mb-4 md:mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl text-[#E6EEF6] mb-1">{title}</h1>
        {subtitle ? (
          <div className="text-[#98A0AC] text-xs md:text-sm">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}