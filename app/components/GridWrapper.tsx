const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-template-rows h-2/4 text-lg w-10/12">
    {children}
  </div>
)

export default Wrapper
