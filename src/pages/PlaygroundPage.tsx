import { Toaster } from 'react-hot-toast';
import ToastDemo from '../components/ToastDemo';
import OrderStatusSelector from '../components/OrderStatusSelector';

const PlaygroundPage = () => {
  return <OrderStatusSelector onChange={(value) => console.log(value)} />;
};

export default PlaygroundPage;
