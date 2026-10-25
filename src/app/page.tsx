import Redactor from "@/components/Redactor";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Redact Image Online
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
          Hide private details in a screenshot or photo before you share it. Draw
          a box over anything sensitive, then download a PNG where those pixels
          are gone for good.
        </p>
      </div>
      <Redactor />
    </div>
  );
}
