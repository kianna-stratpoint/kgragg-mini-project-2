"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function PostFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    router.push(`?${params.toString()}`);
  };

  const tabs = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "popular", label: "Most Popular" },
  ];

  return (
    <div className="w-full border-b border-gray-200 mb-8">
      <div className="flex w-full justify-center md:justify-start gap-6 md:gap-8">
        {tabs.map((tab) => {
          const isActive = currentSort === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => handleSort(tab.value)}
              className={`
                relative pb-3 text-sm font-medium transition-all duration-200
                -mb-px
                ${
                  isActive
                    ? "border-b-2 border-black text-black"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
