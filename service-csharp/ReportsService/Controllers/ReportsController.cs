using Microsoft.AspNetCore.Mvc;
using ReportsService.Models;

namespace ReportsService.Controllers
{
    [ApiController]
    [Route("reports")]
    public class ReportsController : ControllerBase
    {
        [HttpGet("daily")]
        public IActionResult GetDailyReport()
        {
            var report = new DailyReport
            {
                Date = DateTime.UtcNow.Date,
                TotalWorkorders = 12,
                Open = 5,
                InProgress = 4,
                Done = 3,
            };

            return Ok(report);
        }
    }
}
