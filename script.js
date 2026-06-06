// Khởi tạo hoặc tải mảng danh sách từ Local Storage [Yêu cầu kỹ thuật]
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// Lấy các phần tử DOM giao diện popup, form và danh bạ hiển thị
const bookingModal = document.getElementById('booking-modal');
const bookingForm = document.getElementById('booking-form');
const bookingList = document.getElementById('booking-list');
const toastEl = document.getElementById('toast');

const btnOpenForm = document.getElementById('btn-open-form');
const btnCloseForm = document.getElementById('btn-close-form');

// Dom thống kê dữ liệu
const totalBookingsEl = document.getElementById('total-bookings');
const normalBookingsEl = document.getElementById('normal-bookings');
const priorityBookingsEl = document.getElementById('priority-bookings');

// Dom các trường nhập liệu trên biểu mẫu
const formModeInput = document.getElementById('form-mode');
const editingIdInput = document.getElementById('editing-id');
const inputCode = document.getElementById('booking-code');
const inputName = document.getElementById('booking-name');
const inputId = document.getElementById('student-id');
const selectRoom = document.getElementById('room-select');
const inputMembers = document.getElementById('member-count');
const inputDate = document.getElementById('use-date');
const inputPurpose = document.getElementById('booking-purpose');

/**
 * Hiển thị thông điệp thông báo lỗi dưới từng Input cụ thể
 */
function showInputError(inputElement, errorElementId, message) {
    const errorTarget = document.getElementById(errorElementId);
    if (!errorTarget) return;

    if (message) {
        errorTarget.textContent = message;
        if (inputElement) {
            inputElement.classList.add('invalid');
            inputElement.classList.remove('valid');
        }
    } else {
        errorTarget.textContent = '';
        if (inputElement) {
            inputElement.classList.remove('invalid');
            inputElement.classList.add('valid');
        }
    }
}

// ==========================================
// THỰC HIỆN CÁC HÀM VALIDATION CHI TIẾT THEO ĐỀ BÀI
// ==========================================

// 1. Kiểm tra Mã đặt phòng (Booking Code)
function validateCode() {
    const value = inputCode.value.trim();
    if (inputCode.disabled) return true; // Khi chỉnh sửa, bỏ qua bước kiểm tra trùng mã

    if (!value) {
        showInputError(inputCode, 'error-code', 'Mã đặt phòng không được để trống.');
        return false;
    }
    // Định dạng PH-9999
    const codeRegex = /^PH-\d{4}$/;
    if (!codeRegex.test(value)) {
        showInputError(inputCode, 'error-code', 'Phải đúng định dạng PH-9999 (ví dụ: PH-2046).');
        return false;
    }
    // Kiểm tra trùng mã trong Local Storage
    const isExist = bookings.some(b => b.code.toLowerCase() === value.toLowerCase());
    if (isExist) {
        showInputError(inputCode, 'error-code', 'Mã đặt phòng này đã tồn tại trên hệ thống.');
        return false;
    }
    showInputError(inputCode, 'error-code', '');
    return true;
}

// 2. Kiểm tra Họ tên người đặt
function validateName() {
    const value = inputName.value.trim();
    if (!value) {
        showInputError(inputName, 'error-name', 'Họ tên người đặt không được để trống.');
        return false;
    }
    // Chỉ chứa chữ cái tiếng Việt/Anh và khoảng trắng
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐIŨƠàáâãèéêìíòóôõùúăđĩơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰYÝỲỸỶẎỳỹỷỹ\s]+$/;
    if (!nameRegex.test(value)) {
        showInputError(inputName, 'error-name', 'Họ tên chỉ được chứa chữ cái và khoảng trắng.');
        return false;
    }
    // Độ dài từ 5 đến 40 ký tự
    if (value.length < 5 || value.length > 40) {
        showInputError(inputName, 'error-name', 'Độ dài họ tên phải từ 5 đến 40 ký tự.');
        return false;
    }
    showInputError(inputName, 'error-name', '');
    return true;
}

// 3. Kiểm tra Mã sinh viên
function validateId() {
    const value = inputId.value.trim();
    if (!value) {
        showInputError(inputId, 'error-id', 'Mã sinh viên không được để trống.');
        return false;
    }
    // Bắt đầu bằng SV và theo sau là đúng 6 chữ số
    const idRegex = /^SV\d{6}$/;
    if (!idRegex.test(value)) {
        showInputError(inputId, 'error-id', 'Mã sinh viên phải bắt đầu bằng SV và gồm 6 chữ số (VD: SV123456).');
        return false;
    }
    showInputError(inputId, 'error-id', '');
    return true;
}

// 4. Kiểm tra Phòng học
function validateRoom() {
    const value = selectRoom.value;
    if (!value) {
        showInputError(selectRoom, 'error-room', 'Vui lòng chọn một phòng học trong danh sách.');
        return false;
    }
    showInputError(selectRoom, 'error-room', '');
    return true;
}

// 5. Kiểm tra Số lượng thành viên
function validateMembers() {
    const value = inputMembers.value.trim();
    if (!value) {
        showInputError(inputMembers, 'error-members', 'Số lượng thành viên không được để trống.');
        return false;
    }
    const count = parseInt(value, 10);
    // Phải là số nguyên từ 2 đến 8
    if (isNaN(count) || !Number.isInteger(Number(value)) || count < 2 || count > 8) {
        showInputError(inputMembers, 'error-members', 'Số lượng thành viên phải là số nguyên từ 2 đến 8.');
        return false;
    }
    showInputError(inputMembers, 'error-members', '');
    return true;
}

// 6. Kiểm tra Ngày sử dụng phòng
function validateDate() {
    const value = inputDate.value;
    if (!value) {
        showInputError(inputDate, 'error-date', 'Ngày sử dụng phòng không được để trống.');
        return false;
    }

    // Thiết lập mốc thời gian ngày hiện tại (đưa về 00:00:00 để so sánh chuẩn ngày)
    const today = new Date();
    today.setHours(0,0,0,0);

    const selectedDate = new Date(value);
    selectedDate.setHours(0,0,0,0);

    // Tính khoảng cách ngày
    const timeDiff = selectedDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
        showInputError(inputDate, 'error-date', 'Ngày sử dụng phải là ngày hiện tại hoặc trong tương lai.');
        return false;
    }
    if (daysDiff > 14) {
        showInputError(inputDate, 'error-date', 'Ngày sử dụng không được vượt quá 14 ngày kể từ ngày hiện tại.');
        return false;
    }

    showInputError(inputDate, 'error-date', '');
    return true;
}

// 7. Kiểm tra Ca học (Radio)
function validateSlot() {
    const checkedRadio = document.querySelector('input[name="study-slot"]:checked');
    if (!checkedRadio) {
        showInputError(null, 'error-slot', 'Vui lòng chọn một ca học.');
        return false;
    }
    showInputError(null, 'error-slot', '');
    return true;
}

// 8. Kiểm tra Hình thức đặt (Radio)
function validateType() {
    const checkedRadio = document.querySelector('input[name="booking-type"]:checked');
    if (!checkedRadio) {
        showInputError(null, 'error-type', 'Vui lòng chọn hình thức đặt phòng.');
        return false;
    }
    showInputError(null, 'error-type', '');
    return true;
}

// 9. Kiểm tra Email liên hệ
function validateEmail() {
    const inputEmail = document.getElementById('contact-email');
    const value = inputEmail.value.trim();
    if (!value) {
        showInputError(inputEmail, 'error-email', 'Địa chỉ email không được để trống.');
        return false;
    }
    // Định dạng Email chung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showInputError(inputEmail, 'error-email', 'Định dạng Email không chính xác.');
        return false;
    }
    // Phải kết thúc bằng đuôi quy định @sv.haui.edu.vn
    if (!value.toLowerCase().endsWith('@sv.haui.edu.vn')) {
        showInputError(inputEmail, 'error-email', 'Email phải kết thúc bằng đuôi @sv.haui.edu.vn.');
        return false;
    }
    showInputError(inputEmail, 'error-email', '');
    return true;
}

// 10. Kiểm tra Mục đích sử dụng
function validatePurpose() {
    const value = inputPurpose.value.trim();
    if (!value) {
        showInputError(inputPurpose, 'error-purpose', 'Mục đích sử dụng không được để trống.');
        return false;
    }
    if (value.length < 10 || value.length > 100) {
        showInputError(inputPurpose, 'error-purpose', 'Độ dài mục đích sử dụng phải từ 10 đến 100 ký tự.');
        return false;
    }
    // Không chứa các từ khóa cấm nhạy cảm
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('game') || lowerValue.includes('giải trí') || lowerValue.includes('ngủ')) {
        showInputError(inputPurpose, 'error-purpose', 'Mục đích không được chứa các từ khóa cấm: game, giải trí, ngủ.');
        return false;
    }
    showInputError(inputPurpose, 'error-purpose', '');
    return true;
}

// Thiết lập lắng nghe sự kiện Validation thời gian thực khi gõ (Input/Blur)
function setupRealtimeValidation() {
    inputCode.addEventListener('input', validateCode);
    inputCode.addEventListener('blur', validateCode);

    inputName.addEventListener('input', validateName);
    inputName.addEventListener('blur', validateName);

    inputId.addEventListener('input', validateId);
    inputId.addEventListener('blur', validateId);

    selectRoom.addEventListener('change', validateRoom);

    inputMembers.addEventListener('input', validateMembers);
    inputMembers.addEventListener('blur', validateMembers);

    inputDate.addEventListener('change', validateDate);

    document.querySelectorAll('input[name="study-slot"]').forEach(r => r.addEventListener('change', validateSlot));
    document.querySelectorAll('input[name="booking-type"]').forEach(r => r.addEventListener('change', validateType));

    const inputEmail = document.getElementById('contact-email');
    inputEmail.addEventListener('input', validateEmail);
    inputEmail.addEventListener('blur', validateEmail);

    inputPurpose.addEventListener('input', validatePurpose);
    inputPurpose.addEventListener('blur', validatePurpose);
}

// ==========================================
// CÁC HÀM XỬ LÝ LƯU TRỮ VÀ THỐNG KÊ DỮ LIỆU
// ==========================================

function saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function updateStatistics() {
    totalBookingsEl.textContent = bookings.length;
    
    const normalCount = bookings.filter(b => b.type === 'Thường').length;
    const priorityCount = bookings.filter(b => b.type === 'Ưu tiên').length;

    normalBookingsEl.textContent = normalCount;
    priorityBookingsEl.textContent = priorityCount;
}

function showMessage(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    setTimeout(() => toastEl.classList.add('hidden'), 3000);
}

function resetForm() {
    bookingForm.reset();
    formModeInput.value = 'create';
    editingIdInput.value = '';
    document.getElementById('modal-title').textContent = 'Thêm Lượt Đặt Phòng Mới';
    inputCode.disabled = false;

    // Khôi phục lại trạng thái class của các ô nhập liệu
    const inputs = [inputCode, inputName, inputId, selectRoom, inputMembers, inputDate, document.getElementById('contact-email'), inputPurpose];
    inputs.forEach(input => {
        if(input) input.classList.remove('invalid', 'valid');
    });

    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
}

// Đổ danh sách dữ liệu ra bảng
function renderBookings() {
    bookingList.innerHTML = '';
    if (bookings.length === 0) {
        bookingList.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#888;">Chưa có dữ liệu lượt đặt phòng nào trong hệ thống</td></tr>`;
        return;
    }

    bookings.forEach((booking) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${booking.code}</strong></td>
            <td>${booking.name}</td>
            <td>${booking.studentId}</td>
            <td>${booking.room}</td>
            <td>${booking.members}</td>
            <td>${booking.date}</td>
            <td>${booking.slot}</td>
            <td><span class="${booking.type === 'Ưu tiên' ? 'text-danger' : ''}">${booking.type}</span></td>
            <td>${booking.email}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-edit" data-id="${booking.code}">Sửa</button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${booking.code}">Xóa</button>
            </td>
        `;
        bookingList.appendChild(tr);
    });
}

// ==========================================
// ĐĂNG KÝ CÁC SỰ KIỆN CLICK LÊN GIAO DIỆN
// ==========================================

// Mở form popup modal
btnOpenForm.addEventListener('click', () => {
    resetForm();
    bookingModal.classList.remove('hidden');
});

// Đóng form popup modal
btnCloseForm.addEventListener('click', () => {
    bookingModal.classList.add('hidden');
});

// Gửi biểu mẫu dữ liệu (Submit Form)
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Thực thi đồng loạt tất cả các hàm kiểm chứng
    const isCodeValid = validateCode();
    const isNameValid = validateName();
    const isIdValid = validateId();
    const isRoomValid = validateRoom();
    const isMembersValid = validateMembers();
    const isDateValid = validateDate();
    const isSlotValid = validateSlot();
    const isTypeValid = validateType();
    const isEmailValid = validateEmail();
    const isPurposeValid = validatePurpose();

    if (!isCodeValid || !isNameValid || !isIdValid || !isRoomValid || !isMembersValid || 
        !isDateValid || !isSlotValid || !isTypeValid || !isEmailValid || !isPurposeValid) {
        showMessage('Vui lòng hoàn thiện và sửa đúng các thông tin trên Form lỗi!');
        return;
    }

    // Thu thập dữ liệu từ các ô nhập liệu
    const checkedSlot = document.querySelector('input[name="study-slot"]:checked').value;
    const checkedType = document.querySelector('input[name="booking-type"]:checked').value;
    const inputEmail = document.getElementById('contact-email');

    const bookingData = {
        code: inputCode.value.trim(),
        name: inputName.value.trim(),
        studentId: inputId.value.trim(),
        room: selectRoom.value,
        members: parseInt(inputMembers.value.trim(), 10),
        date: inputDate.value,
        slot: checkedSlot,
        type: checkedType,
        email: inputEmail.value.trim(),
        purpose: inputPurpose.value.trim()
    };

    const mode = formModeInput.value;

    if (mode === 'create') {
        bookings.push(bookingData);
        showMessage('Thêm mới lượt đặt phòng học nhóm thành công!');
    } else if (mode === 'edit') {
        const targetId = editingIdInput.value;
        const index = bookings.findIndex(b => b.code === targetId);
        if (index !== -1) {
            bookings[index] = bookingData;
            showMessage('Cập nhật thông tin đặt phòng thành công!');
        }
    }

    // Đồng bộ lại UI và bộ nhớ cục bộ LocalStorage
    saveBookings();
    renderBookings();
    updateStatistics();
    bookingModal.classList.add('hidden');
});

// Xử lý sự kiện nhấn nút Sửa / Xóa trong Bảng (Ủy quyền sự kiện)
bookingList.addEventListener('click', (e) => {
    const target = e.target;
    const bookingCode = target.getAttribute('data-id');
    if (!bookingCode) return;

    // HÀNH ĐỘNG XÓA BẢN GHI
    if (target.classList.contains('btn-delete')) {
        if (confirm(`Bạn có thực sự muốn xóa lượt đặt phòng có mã ${bookingCode}?`)) {
            bookings = bookings.filter(b => b.code !== bookingCode);
            saveBookings();
            renderBookings();
            updateStatistics();
            showMessage('Đã xóa lượt đặt phòng thành công.');
        }
    }

    // HÀNH ĐỘNG SỬA BẢN GHI (Đổ dữ liệu ngược lại form)
    if (target.classList.contains('btn-edit')) {
        const booking = bookings.find(b => b.code === bookingCode);
        if (!booking) return;

        resetForm();

        // Điền lại các giá trị đơn giản
        inputCode.value = booking.code;
        inputCode.disabled = true; // Khóa trường mã phòng không cho sửa theo luật
        
        inputName.value = booking.name;
        inputId.value = booking.studentId;
        selectRoom.value = booking.room;
        inputMembers.value = booking.members;
        inputDate.value = booking.date;
        document.getElementById('contact-email').value = booking.email;
        inputPurpose.value = booking.purpose;

        // Chọn lại đúng nút Radio Ca học
        const radioSlot = document.querySelector(`input[name="study-slot"][value="${booking.slot}"]`);
        if (radioSlot) radioSlot.checked = true;

        // Chọn lại đúng nút Radio Hình thức đặt
        const radioType = document.querySelector(`input[name="booking-type"][value="${booking.type}"]`);
        if (radioType) radioType.checked = true;

        // Cập nhật chế độ form sang chỉnh sửa
        formModeInput.value = 'edit';
        editingIdInput.value = booking.code;
        document.getElementById('modal-title').textContent = 'Cập Nhật Thông Tin Đặt Phòng';

        // Hiển thị modal lên màn hình
        bookingModal.classList.remove('hidden');
    }
});

// Khởi chạy ứng dụng khi DOM tải xong hoàn tất
document.addEventListener('DOMContentLoaded', () => {
    renderBookings();
    updateStatistics();
    setupRealtimeValidation();
});