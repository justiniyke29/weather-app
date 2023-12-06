import Map from "@/components/Map";
import dynamic from "next/dynamic";

// const Map = dynamic(() => import("@/components/Map"), {
//   ssr: false,
// });
export default function Home() {
  return (
    <main className=" w-full max-w-[1440px] items-center justify-center">
      <div className="mx-auto flex justify-around">
        <Map />
      </div>
    </main>
  );
}
