import Image from "next/image";
export default function AxiomOverlay() {
    return (
        <div className="absolute right-4 bottom-8 shadow-lg rounded bg-gray-50 p-2 border">
            <a href="https://axiom.xyz" target="_blank" className="flex flex-row justify-end items-center">
                <div className="text-sm font-semibold pr-1 pt-[1.5px]">
                    Made by
                </div>
                <Image src="/axiom.svg" alt="axiom logo" width={100} height={30} />
            </a>
        </div>
    )
}

