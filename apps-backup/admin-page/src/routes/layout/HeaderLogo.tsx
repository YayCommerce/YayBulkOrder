export default function HeaderLogo() {
  return (
    <div className="justify-left flex h-full">
      <img
        src={window.yayBulkOrderAdminData.path.assetsUrl + '/img/YayBulkOrder.svg'}
        alt="YayBulkOrder"
        className="h-full w-full"
      />
    </div>
  );
}
