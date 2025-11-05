import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import useSwapStore from "../../store/swapStore";
import SwapCard from "../../components/SwapCard";

export default function Requests() {
  const {
    sentRequests,
    receivedRequests,
    fetchSentRequests,
    fetchReceivedRequests,
    respondToSwapRequest,
    cancelSwapRequest,
  } = useSwapStore();

  useEffect(() => {
    fetchSentRequests();
    fetchReceivedRequests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-800">Swap Requests</h1>
          <p className="text-sm text-slate-500">
            Track incoming requests from other users and manage the swaps you have proposed.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700">Incoming Requests</h2>
              <span className="text-sm text-slate-500">{receivedRequests.length}</span>
            </div>

            {receivedRequests.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No incoming requests. When someone targets your slot, it will appear here.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {receivedRequests.map((req) => (
                  <SwapCard
                    key={req._id}
                    swap={req}
                    onAccept={() => respondToSwapRequest(req._id, true)}
                    onReject={() => respondToSwapRequest(req._id, false)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700">Outgoing Requests</h2>
              <span className="text-sm text-slate-500">{sentRequests.length}</span>
            </div>

            {sentRequests.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                You haven’t made any swap requests yet. Propose a swap from the marketplace.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {sentRequests.map((req) => (
                  <SwapCard
                    key={req._id}
                    swap={req}
                    onCancel={() => cancelSwapRequest(req._id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
