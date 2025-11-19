import Script from "next/script";

interface StructuredDataProps {
  data: object | object[];
}

export default function StructuredData({ data }: StructuredDataProps) {
  const jsonData = Array.isArray(data)
    ? data.map((item) => JSON.stringify(item)).join(",\n")
    : JSON.stringify(data);

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: Array.isArray(data) ? `[${jsonData}]` : jsonData,
      }}
    />
  );
}
