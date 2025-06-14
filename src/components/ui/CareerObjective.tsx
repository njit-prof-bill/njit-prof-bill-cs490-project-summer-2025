type CareerObjectiveProps = {
  objective: string;
};

export default function CareerObjective({ objective }: CareerObjectiveProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Career Objective</h3>
      <p className="text-gray-700">{objective}</p>
    </div>
  );
}
