import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchPersonDetail,
  fetchRelationships,
  fetchContactHistory,
  fetchAssociatedClients,
  fetchAllIndividuals,
  clearPersonDetail,
} from "../personDetailSlice";
import { PersonHeader } from "../components/PersonHeader";
import { RelationshipsSection } from "../components/RelationshipsSection";
import { ContactHistorySection } from "../components/ContactHistorySection";
import { AssociatedClientsSection } from "../components/AssociatedClientsSection";

export function PersonDetailPage() {
  const { individualId } = useParams<{ individualId: string }>();
  const dispatch = useAppDispatch();
  const {
    person,
    relationships,
    contactHistory,
    associatedClients,
    allIndividuals,
    loading,
    error,
  } = useAppSelector((state) => state.personDetail);

  useEffect(() => {
    if (!individualId) return;

    dispatch(fetchPersonDetail(individualId));
    dispatch(fetchRelationships(individualId));
    dispatch(fetchContactHistory(individualId));
    dispatch(fetchAssociatedClients(individualId));
    dispatch(fetchAllIndividuals());

    return () => {
      dispatch(clearPersonDetail());
    };
  }, [dispatch, individualId]);

  if (loading) {
    return (
      <div data-testid="person-detail-page" className="p-6 max-sm:p-3">
        <div className="clients-loading">Loading...</div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div data-testid="person-detail-page" className="p-6 max-sm:p-3">
        <div className="clients-empty">{error || "Person not found"}</div>
      </div>
    );
  }

  return (
    <div data-testid="person-detail-page" className="p-6 max-sm:p-3">
      <div className="person-detail">
        <PersonHeader person={person} associatedClients={associatedClients} />

        <RelationshipsSection
          relationships={relationships}
          individualId={person.id}
          allIndividuals={allIndividuals}
        />

        <ContactHistorySection
          contactHistory={contactHistory}
          individualId={person.id}
        />

        <AssociatedClientsSection clients={associatedClients} />
      </div>
    </div>
  );
}
