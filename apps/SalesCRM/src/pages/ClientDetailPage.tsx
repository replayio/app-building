import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchClientDetail,
  fetchTasks,
  fetchDeals,
  fetchAttachments,
  fetchPeople,
  fetchTimeline,
  fetchUsers,
  clearClientDetail,
} from "../clientDetailSlice";
import { ClientHeader } from "../components/ClientHeader";
import { QuickActions } from "../components/QuickActions";
import { SourceInfoSection } from "../components/SourceInfoSection";
import { TasksSection } from "../components/TasksSection";
import { DealsSection } from "../components/DealsSection";
import { AttachmentsSection } from "../components/AttachmentsSection";
import { PeopleSection } from "../components/PeopleSection";
import { TimelineSectionClient } from "../components/TimelineSectionClient";
import { FollowButton } from "../components/FollowButton";
import { AddTaskModal } from "../components/AddTaskModal";
import { AddDealModal } from "../components/AddDealModal";
import { AddAttachmentModal } from "../components/AddAttachmentModal";
import { AddPersonModal } from "../components/AddPersonModal";

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const dispatch = useAppDispatch();
  const { client, tasks, deals, attachments, people, timeline, users, loading, error } =
    useAppSelector((state) => state.clientDetail);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    dispatch(fetchClientDetail(clientId));
    dispatch(fetchTasks(clientId));
    dispatch(fetchDeals(clientId));
    dispatch(fetchAttachments(clientId));
    dispatch(fetchPeople(clientId));
    dispatch(fetchTimeline(clientId));
    dispatch(fetchUsers());

    return () => {
      dispatch(clearClientDetail());
    };
  }, [dispatch, clientId]);

  if (loading) {
    return (
      <div data-testid="client-detail-page" className="p-6 max-sm:p-3">
        <div className="clients-loading">Loading...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div data-testid="client-detail-page" className="p-6 max-sm:p-3">
        <div className="clients-empty">{error || "Client not found"}</div>
      </div>
    );
  }

  return (
    <div data-testid="client-detail-page" className="p-6 max-sm:p-3">
      <div className="client-detail">
        <div className="client-header-top">
          <ClientHeader client={client} />
          <div className="client-header-actions">
            <FollowButton clientId={client.id} />
          </div>
        </div>

        <QuickActions
          onAddTask={() => setShowAddTask(true)}
          onAddDeal={() => setShowAddDeal(true)}
          onAddAttachment={() => setShowAddAttachment(true)}
          onAddPerson={() => setShowAddPerson(true)}
        />

        <SourceInfoSection client={client} />

        <div className="client-detail-sections">
          <TasksSection tasks={tasks} clientId={client.id} />
          <DealsSection deals={deals} />
          <AttachmentsSection attachments={attachments} clientId={client.id} />
          <PeopleSection people={people} />
        </div>

        <TimelineSectionClient events={timeline} />
      </div>

      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        clientId={client.id}
        deals={deals}
        users={users}
      />
      <AddDealModal
        open={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        clientId={client.id}
        users={users}
      />
      <AddAttachmentModal
        open={showAddAttachment}
        onClose={() => setShowAddAttachment(false)}
        clientId={client.id}
        deals={deals}
      />
      <AddPersonModal
        open={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        clientId={client.id}
      />
    </div>
  );
}
