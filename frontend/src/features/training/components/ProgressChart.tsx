interface ProgressPoint {
  date: string;
  weight: number;
}

interface ProgressChartProps {
  data: ProgressPoint[];
}

const ProgressChart = ({ data }: ProgressChartProps) => {
  const maxWeight = Math.max(...data.map((item) => item.weight), 0);

  return (
    <div className="progress-chart">
      <span className="progress-card__label">WYKRES PROGRESU</span>

      <div className="progress-chart__bars">
        {data.map((item) => (
          <div className="progress-chart__item" key={item.date}>
            <div
              className="progress-chart__bar"
              style={{
                height: maxWeight ? `${(item.weight / maxWeight) * 100}%` : "0%",
              }}
            />
            <span>{item.weight} kg</span>
            <small>{item.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;
