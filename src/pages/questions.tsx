import { trpc } from "$utils/trpc";
import Pusher from "pusher-js";
import { FormEventHandler, useEffect, useState } from "react";
import { env } from "../env/client.mjs";

const AskForm = () => {
  const utils = trpc.useContext();
  const { mutate } = trpc.question.add.useMutation({
    onSuccess: () => {
      utils.question.getAll.invalidate();
    },
    onMutate: async ({ text }) => {
      await utils.question.getAll.cancel();

      const previousData = utils.question.getAll.getData() ?? [];

      utils.question.getAll.setData([
        ...previousData,
        { id: "temp", body: text, createdAt: new Date() },
      ]);

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.log(err);

      if (context?.previousData) {
        utils.question.getAll.setData(context.previousData);
      } else {
        utils.question.getAll.invalidate();
      }
    },
  });
  const [question, setQuestion] = useState("");

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (!question) return;
    mutate({ text: question });
    setQuestion("");
  };

  return (
    <>
      <div className="flex flex-col items-center pt-28 text-center">
        <div className="relative flex w-full max-w-lg flex-col items-center rounded border border-gray-500 bg-gray-600 p-8 pt-10">
          <h1 className="mb-8 text-2xl font-bold">Ask a question!</h1>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
            <input
              placeholder="Type something..."
              className="w-full rounded px-4 py-2 text-start text-lg text-gray-800"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-white py-2 px-4 text-center font-bold text-gray-800 hover:bg-gray-100"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const Questions = () => {
  const questions = trpc.question.getAll.useQuery();
  const [latestQuestion, setLatestQuestion] = useState<PusherQuestion | null>(
    null
  );

  type PusherQuestion = {
    body: string;
    sentAt: number;
  };

  useEffect(() => {
    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe("questions");

    channel.bind("new-question", (data: PusherQuestion) => {
      console.log("pusher data: ", data);
      const currentTime = new Date().valueOf();
      console.log("latency: ", currentTime - data.sentAt);
      setLatestQuestion(data);
      questions.refetch();
    });

    return () => pusher.unsubscribe("questions");
  }, [questions]);

  return (
    <>
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <div className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
          <h1 className="text-6xl font-bold">Questions</h1>
        </div>
        <div>
          <h2 className="mt-4 text-2xl">All asked questions:</h2>
          <ul>
            {questions.data?.map((question) => (
              <li className="list-disc text-left" key={question.id}>
                {question.body}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 rounded-2xl bg-green-200 p-8">
          <p>
            <strong>Latest question:</strong>
          </p>
          <p className="text-green-900">
            {latestQuestion?.body ?? "nothing here"}
          </p>
        </div>
        <AskForm />
      </main>
    </>
  );
};

export default Questions;
