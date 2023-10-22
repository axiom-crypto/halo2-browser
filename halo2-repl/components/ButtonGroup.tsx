import Button from "./Button";

export default function ButtonGroup(props: { items: { text: string, onClick: () => Promise<void> | void, shouldLoad?: boolean }[] }) {
    return (
        <div className="flex flex-row gap-2">
            {
                props.items && props.items.map((item, index) => (
                    <div className="relative inline-block" key={index}>
                        <Button key={index} onClick={item.onClick} text={item.text} shouldLoad={item.shouldLoad} />
                    </div>
                ))
            }
        </div>
    )
}