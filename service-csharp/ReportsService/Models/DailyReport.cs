namespace ReportsService.Models
{
    public class DailyReport
    {
        public DateTime Date { get; set; }
        public int TotalWorkorders { get; set; }
        public int Open { get; set; }
        public int InProgress { get; set; }
        public int Done { get; set; }
    }
}
