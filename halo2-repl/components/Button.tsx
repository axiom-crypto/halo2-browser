import { useState } from "react";

export default function Button(props: { text: string, onClick: () => Promise<void> | void, shouldLoad?: boolean }) {

    const [loading, setLoading] = useState(false);
    const buttonOnClick = async () => {
        if (props.shouldLoad) {
            if (!loading) {
                setLoading(true);
                await props.onClick();
                setLoading(false);
            }
        }
        else {
            await props.onClick();
        }
    }

    return (
        <button onClick={buttonOnClick} type="button" className="inline-flex w-full justify-center gap-x-1.5 border border-black bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow ring-1 ring-inset ring-gray-300 hover:bg-gray-200">
            {loading &&
                (<svg className="absolute animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>)
            }
            <span className={loading ? "invisible" : ""}>
                {props.text}
            </span>
        </button>)
}