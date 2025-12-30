import CustomizeForm from './customize/CustomizeForm';
import CustomizePreview from './customize/CustomizePreview';

export default function PageCustomize() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <CustomizeForm />
      <CustomizePreview />
    </div>
  );
}
