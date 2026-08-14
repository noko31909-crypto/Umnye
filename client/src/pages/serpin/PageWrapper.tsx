import SerpinLayout from "@/components/serpin/SerpinLayout";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <SerpinLayout>
      {children}
    </SerpinLayout>
  );
}
