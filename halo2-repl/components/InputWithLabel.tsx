export default function InputWithLabel(props: { label: string, placeholder: string, inputRef: React.RefObject<HTMLTextAreaElement> | null }) {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {props.label}
      </label>
      <div className="mt-2">
        <textarea
          className="block w-full border border-black py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
          placeholder={props.placeholder}
          ref={props.inputRef}
          defaultValue={props.placeholder}
        />
      </div>
    </div>
  )
}