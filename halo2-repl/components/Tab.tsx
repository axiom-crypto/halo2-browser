import { Tab } from '@headlessui/react'


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function TabGroup(props: {items: {text: string, child: React.JSX.Element}[]}) {

    return (
        <>
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl p-1">
                    {props.items && props.items.map((item) => (
                        <Tab
                            key={item.text}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 border focus:ring-black',
                                    selected
                                        ? 'shadow hover:bg-gray-50'
                                        : 'hover:bg-gray-50'
                                )
                            }
                        >
                            {item.text}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {props.items && Object.values(props.items).map((item, idx) => (
                        <Tab.Panel
                            key={idx}
                            className={classNames(
                                'rounded-xl p-2',
                            )}
                        >
                            {item.child}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </>
    )
}
