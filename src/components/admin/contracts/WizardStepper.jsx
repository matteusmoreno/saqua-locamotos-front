import { CheckCircle } from 'lucide-react';

export function WizardStepper({ steps, currentStep }) {
  const progress = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-6 w-full h-1 bg-gray-darker z-0 rounded-full" />
        <div
          className="absolute left-0 top-6 h-1 bg-brand-gold z-0 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
        {steps.map((step) => {
          const done = currentStep > step.num;
          const active = currentStep === step.num;
          const Icon = step.icon;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300 ${
                done ? 'bg-brand-gold border-black-pure text-black-pure' :
                active ? 'bg-black-rich border-brand-gold text-brand-gold shadow-[0_0_15px_rgba(250,204,21,0.3)]' :
                'bg-gray-dark border-gray-darker text-gray-500'
              }`}>
                {done ? <CheckCircle size={22} /> : <Icon size={18} />}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center max-w-[90px] ${
                active || done ? 'text-brand-gold' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
