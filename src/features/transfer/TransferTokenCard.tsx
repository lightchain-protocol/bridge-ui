import { TransferTokenForm } from './TransferTokenForm';
import { Card } from '../../components/layout/Card';

export function TransferTokenCard() {
  return (
    <div className="sm:w-[664px] border border-[rgba(112,100,233,0.24)] rounded-xl relative">
      <div className="absolute left-3.5 top-3.5 w-[calc(100%-28px)] h-[calc(100%-28px)] rounded-[790px] bg-[linear-gradient(90deg,_#2765FF_0%,_#BA2AF9_100%)] blur-[100px]bg-[linear-gradient(90deg,_#2765FF_0%,_#BA2AF9_100%)] blur-[100px]"></div>
      <div className="bg-darker2 py-6 px-3 rounded-t-xl relative z-[2]">
        <h1 className="text-contentBody text-center text-2xl font-semibold leading-[1.3]">LCAI Bridge</h1>
      </div>
      <Card className="rounded-b-xl">
        <TransferTokenForm />
      </Card>
    </div>
  );
}
