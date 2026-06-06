// Lấy mảng `bookings` từ localStorage; nếu không có thì dùng mảng rỗng.
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// Lưu tham chiếu tới các phần tử DOM dùng nhiều lần để tối ưu truy xuất
const bookingModal = document.getElementById('booking-modal'); // modal chứa form
const bookingForm = document.getElementById('booking-form'); // element form
const bookingList = document.getElementById('booking-list'); // tbody chứa danh sách
const toastEl = document.getElementById('toast'); // hộp thông báo

// Nút mở và đóng form
const btnOpenForm = document.getElementById('btn-open-form');
const btnCloseForm = document.getElementById('btn-close-form');

// Phần tử hiển thị số liệu thống kê
const totalBookingsEl = document.getElementById('total-bookings');
const normalBookingsEl = document.getElementById('normal-bookings');
const priorityBookingsEl = document.getElementById('priority-bookings');

// Các trường ẩn / input trong form để điều khiển trạng thái
const formModeInput = document.getElementById('form-mode'); // 'create' hoặc 'edit'
const editingIdInput = document.getElementById('editing-id'); // mã đang sửa
const inputCode = document.getElementById('booking-code'); // input mã đặt phòng
const inputName = document.getElementById('booking-name'); // input họ tên
const inputId = document.getElementById('student-id'); // input mã sinh viên
const selectRoom = document.getElementById('room-select'); // select phòng học
const inputMembers = document.getElementById('member-count'); // số thành viên
const inputDate = document.getElementById('use-date'); // ngày sử dụng
const inputPurpose = document.getElementById('booking-purpose'); // textarea mục đích
const inputEmail = document.getElementById('contact-email'); // input email

function showInputError(inputElement, errorElementId, message) {
    // Lấy phần tử span hiển thị lỗi theo id
    const errorTarget = document.getElementById(errorElementId);
    if (!errorTarget) return; // nếu không tìm thấy span thì thoát

    // Nếu có thông điệp lỗi: hiển thị và đánh dấu input là invalid
    if (message) {
        errorTarget.textContent = message;
        if (inputElement) {
            inputElement.classList.add('invalid');
            inputElement.classList.remove('valid');
        }
    } else {
        // Nếu không có lỗi: xóa thông báo và đánh dấu input là valid
        errorTarget.textContent = '';
        if (inputElement) {
            inputElement.classList.remove('invalid');
            inputElement.classList.add('valid');
        }
    }
}

// 1. Kiểm tra Mã đặt phòng
function validateCode() {
    // Sửa lỗi logic: Nếu đang ở chế độ Edit (Sửa), bỏ qua kiểm tra trùng mã
    if (formModeInput.value === 'edit' || inputCode.disabled) {
        showInputError(inputCode, 'error-code', '');
        return true;
    }
    // Lấy giá trị, loại bỏ khoảng trắng 2 đầu
    const value = inputCode.value.trim();
    if (!value) {
        // Nếu rỗng -> báo lỗi
        showInputError(inputCode, 'error-code', 'Mã đặt phòng không được để trống.');
        return false;
    }
    // Regex bắt đầu bằng PH- theo sau 4 chữ số
    const codeRegex = /^PH-\d{4}$/;
    if (!codeRegex.test(value)) {
        showInputError(inputCode, 'error-code', 'Phải đúng định dạng PH-9999 (ví dụ: PH-2046).');
        return false;
    }
    // Kiểm tra trùng mã (không phân biệt hoa thường)
    const isExist = bookings.some(b => b.code.toLowerCase() === value.toLowerCase());
    if (isExist) {
        showInputError(inputCode, 'error-code', 'Mã đặt phòng này đã tồn tại trên hệ thống.');
        return false;
    }
    // Hợp lệ
    showInputError(inputCode, 'error-code', '');
    return true;
}

// 2. Kiểm tra Họ tên
function validateName() {
    // Lấy họ tên và trim
    const value = inputName.value.trim();
    if (!value) {
        showInputError(inputName, 'error-name', 'Họ tên người đặt không được để trống.');
        return false;
    }
    // Regex cho phép mọi ký tự chữ (Unicode) và khoảng trắng
    const nameRegex = /^[.\p{L}\s]+$/u;
    if (!nameRegex.test(value)) {
        showInputError(inputName, 'error-name', 'Họ tên chỉ được chứa chữ cái và khoảng trắng.');
        return false;
    }
    // Kiểm tra độ dài hợp lý
    if (value.length < 5 || value.length > 40) {
        showInputError(inputName, 'error-name', 'Độ dài họ tên phải từ 5 đến 40 ký tự.');
        return false;
    }
    showInputError(inputName, 'error-name', '');
    return true;
}

// 3. Kiểm tra Mã sinh viên
function validateId() {
    // Mã sinh viên định dạng SV + 6 chữ số
    const value = inputId.value.trim();
    if (!value) {
        showInputError(inputId, 'error-id', 'Mã sinh viên không được để trống.');
        return false;
    }
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
    // Kiểm tra đã chọn phòng hay chưa
    const value = selectRoom.value;
    if (!value) {
        showInputError(selectRoom, 'error-room', 'Vui lòng chọn một phòng học trong danh sách.');
        return false;
    }
    showInputError(selectRoom, 'error-room', '');
    return true;
}

// 5. Kiểm tra Số thành viên
function validateMembers() {
    // Số thành viên phải là số nguyên trong khoảng 2-8
    const value = inputMembers.value.trim();
    if (!value) {
        showInputError(inputMembers, 'error-members', 'Số lượng thành viên không được để trống.');
        return false;
    }
    const count = parseInt(value, 10);
    if (isNaN(count) || !Number.isInteger(Number(value)) || count < 2 || count > 8) {
        showInputError(inputMembers, 'error-members', 'Số lượng thành viên phải là số nguyên từ 2 đến 8.');
        return false;
    }
    showInputError(inputMembers, 'error-members', '');
    return true;
}

// 6. Kiểm tra Ngày sử dụng phòng
function validateDate() {
    // Ngày sử dụng phải tồn tại, không trước ngày hôm nay và không quá 14 ngày
    const value = inputDate.value;
    if (!value) {
        showInputError(inputDate, 'error-date', 'Ngày sử dụng phòng không được để trống.');
        return false;
    }

    // Chuẩn hóa giờ về 00:00 để so sánh đúng ngày
    const today = new Date();
    today.setHours(0,0,0,0);

    const selectedDate = new Date(value);
    selectedDate.setHours(0,0,0,0);

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

// 7. Kiểm tra Ca học
function validateSlot() {
    // Kiểm tra radio group Ca học đã được chọn chưa
    const checkedRadio = document.querySelector('input[name="study-slot"]:checked');
    if (!checkedRadio) {
        showInputError(null, 'error-slot', 'Vui lòng chọn một ca học.');
        return false;
    }
    showInputError(null, 'error-slot', '');
    return true;
}

// 8. Kiểm tra Hình thức đặt
function validateType() {
    // Kiểm tra radio group Hình thức đặt
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
    // Email phải có chữ, ký tự @ và kết thúc bằng domain sv.haui.edu.vn
    const value = inputEmail.value.trim();
    if (!value) {
        showInputError(inputEmail, 'error-email', 'Địa chỉ email không được để trống.');
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // kiểm tra cấu trúc cơ bản
    if (!emailRegex.test(value)) {
        showInputError(inputEmail, 'error-email', 'Định dạng Email không chính xác.');
        return false;
    }
    if (!value.toLowerCase().endsWith('@sv.haui.edu.vn')) {
        showInputError(inputEmail, 'error-email', 'Email phải kết thúc bằng đuôi @sv.haui.edu.vn.');
        return false;
    }
    showInputError(inputEmail, 'error-email', '');
    return true;
}

// 10. Kiểm tra Mục đích sử dụng
function validatePurpose() {
    // Mục đích phải có nội dung, độ dài hợp lý và không chứa từ cấm
    const value = inputPurpose.value.trim(); // loại bỏ khoảng trắng hai đầu
    if (!value) {
        showInputError(inputPurpose, 'error-purpose', 'Mục đích sử dụng không được để trống.');
        return false;
    }
    if (value.length < 10 || value.length > 100) {
        showInputError(inputPurpose, 'error-purpose', 'Độ dài mục đích sử dụng phải từ 10 đến 100 ký tự.');
        return false;
    }
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('game') || lowerValue.includes('giải trí') || lowerValue.includes('ngủ')) {
        showInputError(inputPurpose, 'error-purpose', 'Mục đích không được chứa các từ khóa cấm: game, giải trí, ngủ.');
        return false;
    }
    showInputError(inputPurpose, 'error-purpose', '');
    return true;
}

function setupRealtimeValidation() {
    // Gắn sự kiện để validate khi người dùng nhập hoặc rời input
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
    inputEmail.addEventListener('input', validateEmail);
    inputEmail.addEventListener('blur', validateEmail);
    inputPurpose.addEventListener('input', validatePurpose);
    inputPurpose.addEventListener('blur', validatePurpose);

    // Radio group cần lắng nghe 'change' để validate khi chọn
    document.querySelectorAll('input[name="study-slot"]').forEach(r => r.addEventListener('change', validateSlot));
    document.querySelectorAll('input[name="booking-type"]').forEach(r => r.addEventListener('change', validateType));
}

function saveBookings() {
    // Lưu mảng bookings vào localStorage dưới dạng JSON string
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function updateStatistics() {
    // Cập nhật số liệu thống kê trên giao diện
    totalBookingsEl.textContent = bookings.length;
    normalBookingsEl.textContent = bookings.filter(b => b.type === 'Thường').length;
    priorityBookingsEl.textContent = bookings.filter(b => b.type === 'Ưu tiên').length;
}

function showMessage(msg) {
    // Hiển thị toast và tự ẩn sau 3 giây
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    setTimeout(() => toastEl.classList.add('hidden'), 3000);
}

function resetForm() {
    // Reset form: đưa về chế độ tạo mới, mở khóa input mã và xóa trạng thái lỗi
    bookingForm.reset();
    formModeInput.value = 'create';
    editingIdInput.value = '';
    document.getElementById('modal-title').textContent = 'Thêm Lượt Đặt Phòng Mới';
    inputCode.disabled = false;

    // Xóa class validation trên các input
    const inputs = [inputCode, inputName, inputId, selectRoom, inputMembers, inputDate, inputEmail, inputPurpose];
    inputs.forEach(input => {
        if (input) input.classList.remove('invalid', 'valid');
    });

    // Xóa text thông báo lỗi
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
}

// Đồng bộ kết xuất bảng đầy đủ cột Mục đích sử dụng
function renderBookings() {
    // Vẽ lại bảng danh sách đặt phòng từ mảng bookings
    bookingList.innerHTML = '';
    if (bookings.length === 0) {
        // Nếu không có dữ liệu thì hiển thị thông báo
        bookingList.innerHTML = `<tr><td colspan="11" style="text-align:center; color:#888;">Chưa có dữ liệu lượt đặt phòng nào trong hệ thống</td></tr>`;
        return;
    }

    // Với mỗi booking, tạo <tr> và append vào tbody
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
            <td><small>${booking.purpose}</small></td> <td>
                <button class="btn btn-primary btn-sm btn-edit" data-id="${booking.code}">Sửa</button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${booking.code}">Xóa</button>
            </td>
        `;
        bookingList.appendChild(tr);
    });
}
// Sự kiện mở form: reset trạng thái và hiển thị modal
btnOpenForm.addEventListener('click', () => {
    // Khi bấm mở form: reset trạng thái và hiển thị modal
    resetForm();
    bookingModal.classList.remove('hidden');
});
// Sự kiện đóng form: ẩn modal
btnCloseForm.addEventListener('click', () => {
    // Đóng modal khi bấm Hủy
    bookingModal.classList.add('hidden');
});
// Xử lý sự kiện submit của form: validate, tạo/update booking, lưu và cập nhật giao diện
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Khi submit: validate tất cả trường
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

    // Nếu có lỗi bất kỳ, báo và không tiếp tục
    if (!isCodeValid || !isNameValid || !isIdValid || !isRoomValid || !isMembersValid ||
        !isDateValid || !isSlotValid || !isTypeValid || !isEmailValid || !isPurposeValid) {
        showMessage('Vui lòng hoàn thiện và sửa đúng các thông tin trên Form lỗi!');
        return;
    }

    // Lấy giá trị radio đã chọn
    const checkedSlot = document.querySelector('input[name="study-slot"]:checked').value;
    const checkedType = document.querySelector('input[name="booking-type"]:checked').value;

    // Tạo object booking từ form
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

    // Nếu chế độ tạo mới thì push, nếu edit thì cập nhật phần tử tương ứng
    if (formModeInput.value === 'create') {
        bookings.push(bookingData);
        showMessage('Thêm mới lượt đặt phòng học nhóm thành công!');
    } else {
        const index = bookings.findIndex(b => b.code === editingIdInput.value);
        if (index !== -1) {
            bookings[index] = bookingData;
            showMessage('Cập nhật thông tin đặt phòng thành công!');
        }
    }

    // Lưu và cập nhật giao diện
    saveBookings();
    renderBookings();
    updateStatistics();
    bookingModal.classList.add('hidden');
});
// Sử dụng event delegation để xử lý sự kiện click trên tbody chứa danh sách
bookingList.addEventListener('click', (e) => {
    // Sử dụng event delegation để xử lý nút Sửa/Xóa trong bảng
    const target = e.target;
    const bookingCode = target.getAttribute('data-id');
    if (!bookingCode) return; // không phải nút hành động

    // Xử lý Xóa
    if (target.classList.contains('btn-delete')) {
        if (confirm(`Bạn có thực sự muốn xóa lượt đặt phòng có mã ${bookingCode}?`)) {
            bookings = bookings.filter(b => b.code !== bookingCode); // loại bỏ booking
            saveBookings();
            renderBookings();
            updateStatistics();
            showMessage('Đã xóa lượt đặt phòng thành công.');
        }
    }

    // Xử lý Sửa: điền dữ liệu vào form và mở modal ở chế độ edit
    if (target.classList.contains('btn-edit')) {
        const booking = bookings.find(b => b.code === bookingCode);
        if (!booking) return;

        resetForm();

        // Chuyển form sang chế độ edit và khoá trường mã
        formModeInput.value = 'edit';
        editingIdInput.value = booking.code;
        inputCode.value = booking.code;
        inputCode.disabled = true;

        inputName.value = booking.name;
        inputId.value = booking.studentId; 
        selectRoom.value = booking.room; 
        inputMembers.value = booking.members;
        inputDate.value = booking.date;
        inputEmail.value = booking.email; 
        inputPurpose.value = booking.purpose; 


        // Gán radio tương ứng
        const radioSlot = document.querySelector(`input[name="study-slot"][value="${booking.slot}"]`);
        if (radioSlot) radioSlot.checked = true;

        const radioType = document.querySelector(`input[name="booking-type"][value="${booking.type}"]`);
        if (radioType) radioType.checked = true;

        document.getElementById('modal-title').textContent = 'Cập Nhật Thông Tin Đặt Phòng';
        bookingModal.classList.remove('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Khi tài liệu đã sẵn sàng: render dữ liệu hiện có, cập nhật thống kê và bật validate realtime
    renderBookings();
    updateStatistics();
    setupRealtimeValidation();
});