import type { NextPage } from 'next';
import { TransferTokenCard } from '../features/transfer/TransferTokenCard';

const Home: NextPage = () => {
  return (
    <div className="relative">
      <TransferTokenCard />
    </div>
  );
};

export default Home;
