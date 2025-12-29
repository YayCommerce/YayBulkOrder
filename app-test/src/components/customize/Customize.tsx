import { __ } from "@/lib/utils";


export default function Customize() {
  return (
    <div className="mx-auto mt-6 w-[1000px] max-w-[90%] px-2.5">
      <h1 className="py-4 text-3xl font-bold md:py-8">{__('Customize Test')}</h1>
    </div>
  );
}


