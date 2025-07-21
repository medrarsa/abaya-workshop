import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user._id) {
      navigate("/login");
      return;
    }
    fetch(`${BASE_URL}/api/employees/${user._id}/has-phone`)
      .then(res => res.json())
      .then(data => {
        if (!data.hasPhone) {
          navigate("/add-phone");
        } else {
          fetch(`${BASE_URL}/api/employees/competition/monthly`)
            .then(res => res.json())
            .then(data => setCompetition(Array.isArray(data) ? data : []));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate("/login");
      });
  }, []);

  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>...جاري التحقق</div>;

  return (
    <div style={{
      maxWidth: 900,
      margin: "35px auto",
      padding: isMobile ? 2 : "22px 8px",
      background: "#0f1929",
      borderRadius: 17,
      boxShadow: "0 3px 28px #08143150"
    }}>
      <h2 style={{
        textAlign: "center",
        fontWeight: 900,
        marginBottom: 27,
        color: "#08c0f8",
        fontSize: isMobile ? 20 : 30,
        letterSpacing: 0.3,
        textShadow: "0 2px 8px #040f1e"
      }}>
        سوق المنافسة الشهرية للموظفين
      </h2>
      {isMobile
        ? <MobileCompetitionList competition={competition} user={user} />
        : <DesktopCompetitionTable competition={competition} user={user} />
      }
      <div style={{
        textAlign: "center",
        marginTop: 28,
        color: "#99c1f6",
        fontWeight: 700,
        fontSize: isMobile ? 12.8 : 16,
        letterSpacing: 0.2
      }}>
        تابع ترتيبك هذا الشهر وتحدى زملاءك! <br />
        <span style={{ color: "#13f598", marginRight: 8, fontWeight: 900 }}>▲ الأعلى نشاطًا</span>
        <span style={{ color: "#fe4e4e", marginRight: 8, fontWeight: 900 }}>▼ الأقل</span>
        <span style={{ color: "#aaa", marginRight: 8, fontWeight: 900 }}>— حول المتوسط</span>
      </div>
    </div>
  );
}

function DesktopCompetitionTable({ competition, user }) {
  return (
    <div style={{
      background: "#1d2236",
      borderRadius: 13,
      boxShadow: "0 1.5px 14px #11192877",
      overflowX: "auto"
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 19,
        minWidth: 720,
      }}>
        <thead>
          <tr style={{ background: "#182a42" }}>
            <th style={thStyle}>المركز</th>
            <th style={thStyle}>الاسم</th>
            <th style={thStyle}>الوظيفة</th>
            <th style={thStyle}>عدد الحركات</th>
            <th style={thStyle}>النشاط</th>
          </tr>
        </thead>
        <tbody>
          {competition.length === 0 && (
            <tr>
              <td colSpan={5} style={{
                ...tdStyle,
                textAlign: "center",
                padding: 44,
                color: "#2453c880",
                fontWeight: 800,
                fontSize: 23
              }}>
                <span style={{ fontSize: 54, color: "#b6e3ff" }}>📉</span><br />
                لا توجد بيانات منافسة لهذا الشهر بعد<br />
                تابع الصفحة لاحقًا...!
              </td>
            </tr>
          )}
          {competition.map((emp, i) => (
            <tr key={emp._id}
              style={{
                background: emp._id === user._id ? "#1c3550" : i % 2 === 0 ? "#232b41" : "#181e2e",
                fontWeight: emp._id === user._id ? 900 : 600,
                color: emp._id === user._id ? "#0fe0fa" : "#e8fafd"
              }}>
              <td style={{
                ...tdStyle,
                fontSize: 22,
                fontWeight: "bold"
              }}>
                {i === 0 && <span style={{
                  color: "#ffd700",
                  fontSize: 27,
                  marginRight: 3
                }}>🥇</span>}
                {i === 1 && <span style={{
                  color: "#c0c0c0",
                  fontSize: 24,
                  marginRight: 3
                }}>🥈</span>}
                {i === 2 && <span style={{
                  color: "#ad6e31",
                  fontSize: 24,
                  marginRight: 3
                }}>🥉</span>}
                #{emp.rank}
              </td>
              <td style={{
                ...tdStyle,
                color: emp._id === user._id ? "#0fe0fa" : "#e8fafd",
                fontWeight: emp._id === user._id ? 900 : 700,
                letterSpacing: 0.7
              }}>
                {emp.name}
                {emp._id === user._id && <span style={{
                  color: "#13f598", fontWeight: 900, fontSize: 14, marginRight: 8
                }}> (أنت)</span>}
              </td>
              <td style={{ ...tdStyle, fontSize: 18 }}>{emp.jobType}</td>
              <td style={{
                ...tdStyle,
                color: emp.count > 0 ? "#13f598" : "#fe4e4e",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 1
              }}>
                {emp.count}
              </td>
              <td style={tdStyle}>
                <AnimatedTrend trend={emp.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileCompetitionList({ competition, user }) {
  if (!competition.length) {
    return (
      <div style={{
        padding: 24, textAlign: "center", fontWeight: 700, color: "#2453c880"
      }}>
        <span style={{ fontSize: 44, color: "#b6e3ff" }}>📉</span><br />
        لا توجد بيانات منافسة لهذا الشهر بعد<br />
        تابع الصفحة لاحقًا...!
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 0,
      margin: "0 3px 7px"
    }}>
      {competition.map((emp, i) => (
        <div key={emp._id}
          style={{
            background: emp._id === user._id ? "#1b3d5b" : "#111728",
            borderBottom: "2.5px solid #182a42",
            borderLeft: emp.trend === "up" ? "4px solid #13f598"
              : emp.trend === "down" ? "4px solid #fe4e4e"
                : "4px solid #aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 10px",
            fontWeight: 900,
            color: emp._id === user._id ? "#08c0f8" : "#e8fafd",
            fontSize: 15,
            position: "relative"
          }}>
          <div style={{
            fontSize: 19,
            fontWeight: "bold",
            minWidth: 32,
            color: "#ffe082"
          }}>
            {i === 0 && <span style={{ marginRight: 2 }}>🥇</span>}
            {i === 1 && <span style={{ color: "#aaa", marginRight: 2 }}>🥈</span>}
            {i === 2 && <span style={{ color: "#ad6e31", marginRight: 2 }}>🥉</span>}
            #{emp.rank}
          </div>
          <div style={{
            flex: 1,
            textAlign: "right",
            fontWeight: 900,
            fontSize: 16,
            color: emp._id === user._id ? "#13f598" : "#e8fafd"
          }}>
            {emp.name}
            {emp._id === user._id && <span style={{
              color: "#16f1b0", fontWeight: 900, fontSize: 13, marginRight: 4
            }}> (أنت)</span>}
          </div>
          <div style={{
            minWidth: 54,
            color: "#8fc7ff",
            fontWeight: 600,
            fontSize: 12,
            textAlign: "center"
          }}>{emp.jobType}</div>
          <div style={{
            minWidth: 36,
            fontWeight: 900,
            fontSize: 18,
            color: emp.count > 0 ? "#13f598" : "#fe4e4e",
            textAlign: "center"
          }}>
            {emp.count}
          </div>
          <div style={{ minWidth: 26, fontWeight: 900, textAlign: "center" }}>
            <AnimatedTrend trend={emp.trend} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnimatedTrend({ trend }) {
  if (trend === "up")
    return (
      <span style={{
        color: "#13f598",
        fontWeight: 800,
        fontSize: 25,
        boxShadow: "0 0 10px #34d39950",
        verticalAlign: "middle",
        animation: "trendUp 1.1s infinite alternate"
      }}>▲</span>
    );
  if (trend === "down")
    return (
      <span style={{
        color: "#fe4e4e",
        fontWeight: 800,
        fontSize: 25,
        boxShadow: "0 0 10px #ff9797b0",
        verticalAlign: "middle",
        animation: "trendDown 1.1s infinite alternate"
      }}>▼</span>
    );
  return (
    <span style={{
      color: "#aaa",
      fontWeight: 700,
      fontSize: 18,
      verticalAlign: "middle"
    }}>—</span>
  );
}

const thStyle = {
  padding: "14px",
  textAlign: "center",
  borderBottom: "2.3px solid #334263",
  fontWeight: 900,
  color: "#13c5f5",
  fontSize: 18,
  background: "#182a42"
};

const tdStyle = {
  padding: "13px",
  textAlign: "center",
  borderBottom: "1px solid #2d3753",
  fontWeight: 700,
  color: "#e8fafd"
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes trendUp { 0%{transform: translateY(0);} 100%{transform: translateY(-6px);} }
@keyframes trendDown { 0%{transform: translateY(0);} 100%{transform: translateY(6px);} }
body { background: #0e1625 !important; }
`;
document.head.appendChild(style);
