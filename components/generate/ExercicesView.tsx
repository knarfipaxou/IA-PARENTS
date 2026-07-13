import React from 'react';
import { QcmBlock } from './QcmBlock';
import type { Exercises } from '../../services/ai';

/** Exercices mélangés ou test piégeux : liste de blocs QCM sans score final. */
export function ExercicesView({ exercises }: { exercises: Exercises }) {
  return (
    <>
      {(exercises.exercices ?? []).map((exo, i) => (
        <QcmBlock key={i} exo={exo} index={i} />
      ))}
    </>
  );
}
