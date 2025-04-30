import ReactECharts from 'echarts-for-react';

type ChartProps = {
  title: string;
  data: {
    date: string;
    [key: string]: number | string;
  }[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
};

const LineChart = ({ title, data, lines }: ChartProps) => {
  const dates = data.map((item) => {
    const date = new Date(item.date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  });

  const series = lines.map((line) => ({
    name: line.name,
    type: 'line',
    smooth: true,
    data: data.map((item) => [
      new Date(item.date).getTime(), // x value = timestamp
      item[line.dataKey], // y value = revenue/cost/profit
    ]),
    lineStyle: {
      width: 2,
      color: line.color,
    },
    itemStyle: {
      color: line.color,
    },
    showSymbol: false,
    clip: false,
  }));
  const option = {
    title: {
      text: title,
      left: '-6px',
      top: 10,
      textStyle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
      },
    },
    grid: {
      top: 60,
      left: 0,
      right: 10,
      bottom: 0,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#111827',
      },
      axisPointer: {
        type: 'line',
      },
      formatter: function (params: any) {
        const date = new Date(params[0].value[0]);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${day}/${month}`;

        let tooltip = `<div style="margin-bottom: 4px; font-weight: 600;">${formattedDate}</div>`;
        params.forEach((p: any) => {
          tooltip += `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${p.color};"></span>
              <span> €${Number(p.data[1]).toFixed(2)}</span>
            </div>
          `;
        });

        return tooltip;
      },
    },
    legend: {
      top: 10,
      right: 5,
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
      },
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisTick: { alignWithLabel: true },
      axisLine: {
        lineStyle: { color: '#e5e7eb', width: 2 },
      },
      axisLabel: {
        margin: 10,
        color: '#6b7280',
        fontSize: 12,
        formatter: function (value: number, index: number) {
          const date = new Date(value);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const dateStr = `${day}/${month}`;

          // 👇 Add logs here
          console.log('index:', index, 'label:', dateStr);

          const totalDays = dates.length;
          const labelsWanted = totalDays > 31 ? 8 : 7;
          const interval = Math.floor(totalDays / labelsWanted);

          const labelIndex = dates.findIndex((d) => d === dateStr);
          console.log('→ labelIndex:', labelIndex);

          if (labelIndex === -1) return '';

          const isLast = labelIndex === dates.length - 1;

          if (labelIndex % interval === 0 && !isLast) {
            return dateStr;
          }

          return '';
        },
        showMinLabel: true,
        showMaxLabel: false,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: '#d1d5db' },
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
      },
    },
    series,
  };

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
};

export default LineChart;
