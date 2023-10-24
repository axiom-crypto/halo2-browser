export default function MenuButton(props: { text: string, onClick: () => Promise<void> | void }) {
    return (
        <div className="relative inline-block text-left">
            <div>
                <button onClick={props.onClick} className="inline-flex w-full justify-center gap-x-1.5 border-l border-black bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200">
                    {props.text}
                </button>
            </div>
        </div>
    )
}