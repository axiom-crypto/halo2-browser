import { Component, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function MenuDropdown(props: { text: string, items: { text: string, onClick: () => Promise<void> | void }[] }) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 border-l border-black bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200">
                    {props.text}
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-1.5 w-40 origin-top-left divide-y divide-gray-100 border border-black bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div>
                        {
                            props.items && props.items.map((item, index) => (
                                <Menu.Item key={index}>
                                    {({ active }) => (
                                        <a
                                            href="#"
                                            onClick={item.onClick}
                                            className={classNames(
                                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                'block px-4 py-2 text-sm border-b border-black'
                                            )}
                                        >
                                            {item.text}
                                        </a>
                                    )}
                                </Menu.Item>
                            ))
                        }
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
