const BackgroundPattern = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
    </div>
);

export default BackgroundPattern;
