import { Card } from '../../components/layout/Card';
import { TransferTokenForm } from './TransferTokenForm';

export function TransferTokenCard() {
  return (
    <div className="sm:w-[664px] border border-[rgba(112,100,233,0.24)] rounded-xl relative">
      <div className="bg-darker2 py-6 px-3 rounded-t-xl relative z-[2]">
        <h1 className="text-contentBody text-center text-2xl font-semibold leading-[1.3]">LCAI Bridge</h1>
      </div>
      <Card className="rounded-b-xl">
        <TransferTokenForm />
      </Card>
    </div>
  );
}