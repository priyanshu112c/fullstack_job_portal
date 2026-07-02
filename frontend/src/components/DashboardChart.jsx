import { Line } from 'react-chartjs-2';
const DashboardChart = ({ data }) => {
    return (
        <Line data={data} />
    )
}
export default DashboardChart;