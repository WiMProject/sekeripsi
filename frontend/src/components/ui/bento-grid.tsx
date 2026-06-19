import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition-all duration-500 shadow-none p-6 bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] flex flex-col justify-between space-y-4 relative overflow-hidden",
        className
      )}
    >
      {header && (
        <div className="w-full h-28 rounded-xl overflow-hidden flex-shrink-0">
          {header}
        </div>
      )}
      <div className="group-hover/bento:translate-x-2 transition duration-300 flex-1 flex flex-col justify-end">
        {icon && <div className="mb-2">{icon}</div>}
        {title && (
          <div className="font-bold text-white mb-1.5 text-base">
            {title}
          </div>
        )}
        {description && (
          <div className="text-slate-400 text-xs leading-relaxed font-normal">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};
