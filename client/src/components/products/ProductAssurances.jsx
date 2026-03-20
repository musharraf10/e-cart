// import { HiCheckCircle } from "react-icons/hi";

// const assurances = [
//   ["Original", "100% Original"],
//   ["Returns", "7-Day Returns"],
//   ["Secure", "Secure Pay"],
//   ["Delivery", "Fast Delivery"],
// ];

// export function ProductAssurances() {
//   return (
//     <div className="grid grid-cols-2 gap-2">
//       {assurances.map(([label, text]) => (
//         <div
//           key={text}
//           className="flex items-center gap-2 rounded-lg border border-[#262626] bg-card px-3 py-2"
//         >
//           {/* Icon */}
//           <HiCheckCircle className="w-4 h-4 text-accent shrink-0" />

//           {/* Text */}
//           <div className="leading-tight">
//             <p className="text-[10px] uppercase tracking-wide text-accent font-semibold">
//               {label}
//             </p>
//             <p className="text-[11px] text-muted">{text}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import { HiCheckCircle } from "react-icons/hi";

const assurances = [
  "100% Original",
  "Secure Pay",
  "Fast Delivery",
];

export function ProductAssurances() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted border-t border-[#262626] pt-3">
      {assurances.map((text, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <HiCheckCircle className="w-4 h-4 text-accent" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}