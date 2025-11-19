export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date.toString());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}년 전`;
  if (months > 0) return `${months}개월 전`;
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return `방금 전`;
}

export function shareThis(url) {
  if (navigator.share) {
    navigator
      .share({
        title: "웹페이지 공유",
        text: "이 페이지를 확인해보세요!",
        url: url,
      })
      .then(() => console.log("공유 성공"))
      .catch((error) => console.log("공유 실패", error));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("URL이 클립보드에 복사되었습니다!");
      })
      .catch((error) => {
        alert("클립보드 복사에 실패했습니다: " + error);
      });
  } else {
    // fallback for very old browsers
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert("URL이 클립보드에 복사되었습니다!");
    } catch (err) {
      alert("복사 기능을 지원하지 않는 브라우저입니다. 직접 복사해 주세요.");
    }
    document.body.removeChild(textarea);
  }
}


// new codes

export function getFirstRevision(revisions) {
  let revision = revisions.reduce((oldest, current) =>
    new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest
  );
  return addMethods(revision);
}

export function getLastRevision(revisions) {
  let revision = revisions.reduce((oldest, current) =>
    new Date(current.timestamp) > new Date(oldest.timestamp) ? current : oldest
  );
  return addMethods(revision);
}

export function getRelativeTimeDiff(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp.toString());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return [years, "y"];
  if (months > 0) return [months, "m"];
  if (days > 0) return [days, "d"];
  if (hours > 0) return [hours, "h"];
  if (minutes > 0) return [minutes, "m"];
  return ["", "now"];
}

export function addMethods(revision) {
  return {
    ...revision,
    getTimestamp() {
      return {
        timestamp: this.timestamp,
        getRelativeTimeDiff: () => getRelativeTimeDiff(this.timestamp),
        toString: function () {
          return this.timestamp; // 객체를 문자열처럼 반환
        }
      };
    }
  };
}

export function toKODate (timestamp) {
  // Date 객체 생성
  const date = new Date(timestamp.toString());

  // 한국 시간대(KST, UTC+9)로 변환
  const options = { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" };
  return new Intl.DateTimeFormat("ko-KR", options).format(date);
}

export function toDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}



// public/scripts/linkify.js
export function linkifyFootnoteUrls() {
  const footnotes = document.querySelectorAll('.footnotes li p span');
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;

  footnotes.forEach((span) => {
    const originalText = span.textContent ?? '';
    const linkedHTML = originalText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    span.innerHTML = linkedHTML;
  });
}