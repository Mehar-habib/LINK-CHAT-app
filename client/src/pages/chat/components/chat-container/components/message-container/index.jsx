import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef } from "react";

function MessageContainer() {
  const scrollRef = useRef();
  const { selectedChatType, selectedChatData, selectedChatMessages } =
    useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("DD/MM/YYYY");
      const showDate = messageDate != lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessage(message)}
        </div>
      );
    });
  };
  const renderDMMessage = (message) => (
    <div
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#4f46e5]/20 text-[#dcdafe] border border-[#6366f1]/40"
              : "bg-[#1f2937]/50 text-[#e5e7eb] border border-[#334155]/40"
          } border inline-block p-4 my-1 max-w-[50%] break-words rounded-lg text-justify`}
        >
          {message.content}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  );
}

export default MessageContainer;
