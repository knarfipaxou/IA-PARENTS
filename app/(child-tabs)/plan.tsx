import { Redirect } from 'expo-router';

/** Stub — le parcours vit dans /parcours (hors tabs). */
export default function PlanStub() {
  return <Redirect href="/(child-tabs)/espace" />;
}
