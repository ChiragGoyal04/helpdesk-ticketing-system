// ==========================================
// Application State
// ==========================================
const state = {
    users: [],       // Array of { id, name, email, role }
    tickets: [],     // Array of { id, title, description, status, priority, createdBy, agentName }
    comments: {},    // Map of ticketId -> Array of { id, message, createdAt, createdBy, ticket_id }
    filters: {
        status: '',
        priority: '',
        search: ''
    },
    actingUserId: null, // User ID currently selected to perform actions (creating tickets, writing comments)
    activeTicketId: null // Ticket currently open in the detail drawer
};

// ==========================================
// API Helper Functions
// ==========================================
async function apiRequest(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errJson = await response.json();
            errorMsg = errJson.message || errorMsg;
        } catch (e) {
            try {
                const errText = await response.text();
                errorMsg = errText || errorMsg;
            } catch (e2) {}
        }
        throw new Error(errorMsg);
    }
    
    // Check if there is content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.text(); // for plain string responses
    }
}

// ==========================================
// Probing / Discovery Layer
// ==========================================
async function probeUsers() {
    try {
        const usersList = await apiRequest('/user/all');
        // Since users cannot be deleted, their database IDs are sequential starting from 1.
        state.users = usersList.map((user, index) => ({
            id: index + 1,
            ...user
        }));
    } catch (e) {
        console.error("Error loading users:", e);
        state.users = [];
    }
}

async function probeTickets() {
    try {
        const allTicketsList = await apiRequest('/tickets/all');
        const totalTicketsCount = allTicketsList.length;
        if (totalTicketsCount === 0) {
            state.tickets = [];
            return;
        }
        
        const ticketsList = [];
        let foundCount = 0;
        let consecutiveErrors = 0;
        let id = 1;
        
        // Optimize probing: stop immediately when we've found all tickets
        while (foundCount < totalTicketsCount && consecutiveErrors < 15 && id < 1000) {
            try {
                const res = await fetch(`/tickets/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    ticketsList.push({ id, ...data });
                    foundCount++;
                    consecutiveErrors = 0;
                } else {
                    consecutiveErrors++;
                }
            } catch (e) {
                consecutiveErrors++;
            }
            id++;
        }
        state.tickets = ticketsList;
    } catch (e) {
        console.error("Error loading tickets:", e);
        state.tickets = [];
    }
}

async function probeComments() {
    const tickets = state.tickets;
    if (tickets.length === 0) {
        state.comments = {};
        return;
    }
    
    try {
        // Find total comments count in the system
        let totalCommentsCount = 0;
        for (const ticket of tickets) {
            try {
                const comments = await apiRequest(`/comment/ticket/${ticket.id}`);
                totalCommentsCount += comments.length;
            } catch (e) {
                console.error(`Error checking comment count for ticket ${ticket.id}:`, e);
            }
        }
        
        if (totalCommentsCount === 0) {
            state.comments = {};
            return;
        }
        
        const allComments = {};
        let foundCount = 0;
        let consecutiveErrors = 0;
        let id = 1;
        
        // Optimize probing: stop immediately when we've found all comments
        while (foundCount < totalCommentsCount && consecutiveErrors < 15 && id < 2000) {
            try {
                const res = await fetch(`/comment/get/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    const ticketId = data.ticket_id;
                    if (!allComments[ticketId]) {
                        allComments[ticketId] = [];
                    }
                    allComments[ticketId].push({ id, ...data });
                    foundCount++;
                    consecutiveErrors = 0;
                } else {
                    consecutiveErrors++;
                }
            } catch (e) {
                consecutiveErrors++;
            }
            id++;
        }
        state.comments = allComments;
    } catch (e) {
        console.error("Error loading comments:", e);
        state.comments = {};
    }
}

async function reloadAllData() {
    showToast("Syncing data with server...", "info");
    try {
        // Run sequentially because probeComments relies on state.tickets populated by probeTickets
        await probeUsers();
        await probeTickets();
        await probeComments();
        
        // Auto-select first user as active user if not already set
        if (!state.actingUserId && state.users.length > 0) {
            state.actingUserId = state.users[0].id;
        }
        
        renderAll();
        showToast("System synchronized!", "success");
    } catch (e) {
        console.error(e);
        showToast("Error syncing data: " + e.message, "error");
    }
}

// ==========================================
// Rendering Layer
// ==========================================
function renderAll() {
    renderUserSelector();
    renderUsersList();
    renderTickets();
    renderStats();
    populateDropdowns();
}

function renderUserSelector() {
    const select = document.getElementById('acting-user-select');
    const currentValue = state.actingUserId;
    
    select.innerHTML = '';
    if (state.users.length === 0) {
        select.innerHTML = '<option value="">(Create a User first)</option>';
        return;
    }
    
    state.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.role})`;
        if (user.id === currentValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function renderUsersList() {
    const container = document.getElementById('users-container');
    container.innerHTML = '';
    
    if (state.users.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fa-solid fa-users-slash"></i>
            <h3>No users registered</h3>
            <p>Register a user to start managing tickets.</p>
        </div>`;
        return;
    }
    
    state.users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-item';
        card.innerHTML = `
            <div class="user-meta-row">
                <span class="user-name-tag">${user.name}</span>
                <span class="user-role-badge ${user.role.toLowerCase()}">${user.role}</span>
            </div>
            <div class="user-email-tag">${user.email}</div>
            <div class="user-id-tag">Database ID: ${user.id}</div>
        `;
        container.appendChild(card);
    });
}

function renderStats() {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
    
    state.tickets.forEach(ticket => {
        if (counts[ticket.status] !== undefined) {
            counts[ticket.status]++;
        }
    });
    
    document.getElementById('stat-open-count').textContent = counts.OPEN;
    document.getElementById('stat-progress-count').textContent = counts.IN_PROGRESS;
    document.getElementById('stat-resolved-count').textContent = counts.RESOLVED;
    document.getElementById('stat-closed-count').textContent = counts.CLOSED;
}

function renderTickets() {
    const container = document.getElementById('tickets-container');
    container.innerHTML = '';
    
    // Filter tickets
    const filtered = state.tickets.filter(ticket => {
        const matchesStatus = !state.filters.status || ticket.status === state.filters.status;
        const matchesPriority = !state.filters.priority || ticket.priority === state.filters.priority;
        
        let matchesSearch = true;
        if (state.filters.search) {
            const query = state.filters.search.toLowerCase();
            const title = (ticket.title || '').toLowerCase();
            const desc = (ticket.description || '').toLowerCase();
            const creator = (ticket.createdBy || '').toLowerCase();
            const agent = (ticket.agentName || '').toLowerCase();
            matchesSearch = title.includes(query) || desc.includes(query) || creator.includes(query) || agent.includes(query);
        }
        
        return matchesStatus && matchesPriority && matchesSearch;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <h3>No tickets found</h3>
            <p>Try resetting the search or filters, or create a new support ticket.</p>
        </div>`;
        return;
    }
    
    filtered.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div class="ticket-card-header">
                <span class="ticket-card-id">#${ticket.id}</span>
                <div class="ticket-badges">
                    <span class="status-badge ${ticket.status.toLowerCase()}">${ticket.status.replace('_', ' ')}</span>
                    <span class="priority-badge ${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                </div>
            </div>
            <h3 class="ticket-card-title">${escapeHTML(ticket.title)}</h3>
            <p class="ticket-card-desc">${escapeHTML(ticket.description)}</p>
            <div class="ticket-people">
                <div class="ticket-person">
                    <i class="fa-solid fa-circle-user"></i>
                    Creator: <span>${escapeHTML(ticket.createdBy)}</span>
                </div>
                <div class="ticket-person">
                    <i class="fa-solid fa-headset"></i>
                    Agent: <span>${escapeHTML(ticket.agentName || 'Unassigned')}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openTicketDrawer(ticket.id));
        container.appendChild(card);
    });
}

function populateDropdowns() {
    const creatorSelect = document.getElementById('ticket-creator');
    const agentSelect = document.getElementById('ticket-agent');
    const commentUserSelect = document.getElementById('comment-user-select');
    
    creatorSelect.innerHTML = '<option value="">Select Creator...</option>';
    agentSelect.innerHTML = '<option value="">Select Agent...</option>';
    if (commentUserSelect) {
        commentUserSelect.innerHTML = '<option value="">Select User...</option>';
    }
    
    state.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.role})`;
        
        creatorSelect.appendChild(option.cloneNode(true));
        
        if (commentUserSelect) {
            commentUserSelect.appendChild(option.cloneNode(true));
        }
        
        // Agents and Admins can be assigned as support staff
        if (user.role === 'AGENT' || user.role === 'ADMIN') {
            agentSelect.appendChild(option.cloneNode(true));
        }
    });
}

// ==========================================
// Modals and Drawer Controls
// ==========================================
function toggleModal(modalId, isVisible) {
    const modal = document.getElementById(modalId);
    if (isVisible) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

async function openTicketDrawer(ticketId) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    state.activeTicketId = ticketId;
    
    // Set text elements
    document.getElementById('drawer-ticket-id').textContent = `#${ticket.id}`;
    document.getElementById('drawer-ticket-title').textContent = ticket.title;
    document.getElementById('drawer-ticket-desc').textContent = ticket.description;
    
    // Status Badge
    const statusEl = document.getElementById('drawer-ticket-status');
    statusEl.className = `status-badge ${ticket.status.toLowerCase()}`;
    statusEl.textContent = ticket.status.replace('_', ' ');
    
    // Priority Badge
    const priorityEl = document.getElementById('drawer-ticket-priority');
    priorityEl.className = `priority-badge ${ticket.priority.toLowerCase()}`;
    priorityEl.textContent = ticket.priority;
    
    // People
    document.getElementById('drawer-ticket-creator').textContent = ticket.createdBy;
    document.getElementById('drawer-ticket-agent').textContent = ticket.agentName || 'Unassigned';
    
    // Set management selector values
    const statusSelect = document.getElementById('drawer-status-select');
    statusSelect.value = ticket.status;
    
    const agentSelect = document.getElementById('drawer-agent-select');
    agentSelect.innerHTML = '<option value="">Unassigned</option>';
    state.users.forEach(user => {
        if (user.role === 'AGENT' || user.role === 'ADMIN') {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            agentSelect.appendChild(option);
        }
    });
    
    // Pre-select current agent if assigned
    const activeAgentObj = state.users.find(u => u.name === ticket.agentName);
    if (activeAgentObj) {
        agentSelect.value = activeAgentObj.id;
    }
    
    // Pre-select comment acting user
    const commentUserSelect = document.getElementById('comment-user-select');
    if (commentUserSelect && state.actingUserId) {
        commentUserSelect.value = state.actingUserId;
    }
    
    // Render comments list
    renderCommentsList(ticketId);
    
    // Open drawer
    document.getElementById('ticket-drawer').classList.remove('hidden');
}

function closeTicketDrawer() {
    document.getElementById('ticket-drawer').classList.add('hidden');
    state.activeTicketId = null;
}

function renderCommentsList(ticketId) {
    const container = document.getElementById('comments-container');
    container.innerHTML = '';
    
    const ticketComments = state.comments[ticketId] || [];
    
    if (ticketComments.length === 0) {
        container.innerHTML = `<div class="no-comments">No discussion yet. Be the first to comment!</div>`;
        return;
    }
    
    // Sort comments by ID/Creation time ascending
    const sorted = [...ticketComments].sort((a, b) => a.id - b.id);
    
    sorted.forEach(c => {
        const date = c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Just now';
        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${escapeHTML(c.createdBy)}</span>
                <span class="comment-time">${date}</span>
            </div>
            <div class="comment-msg">${escapeHTML(c.message)}</div>
            <button class="comment-delete-btn" onclick="handleDeleteComment(event, ${c.id})" title="Delete Comment">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// Operations handlers (Submit/Delete/Patch)
// ==========================================
async function handleCreateUser(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    try {
        const responseText = await apiRequest('/user/create', 'POST', { name, email, password, role });
        showToast(responseText, "success");
        document.getElementById('create-user-form').reset();
        
        // Scan new user
        await probeUsers();
        renderUserSelector();
        renderUsersList();
        populateDropdowns();
    } catch (err) {
        showToast("Failed to create user: " + err.message, "error");
    }
}

async function handleCreateTicket(e) {
    e.preventDefault();
    const title = document.getElementById('ticket-title').value;
    const description = document.getElementById('ticket-description').value;
    const priority = document.getElementById('ticket-priority').value;
    const status = document.getElementById('ticket-status').value;
    const createdById = parseInt(document.getElementById('ticket-creator').value);
    const assignedAgentId = parseInt(document.getElementById('ticket-agent').value);
    
    if (!createdById || !assignedAgentId) {
        showToast("Please select both a Creator and an Assigned Agent.", "error");
        return;
    }
    
    try {
        await apiRequest('/tickets/create', 'POST', {
            title, description, status, priority, createdById, assignedAgentId
        });
        
        showToast("Ticket created successfully!", "success");
        document.getElementById('create-ticket-form').reset();
        toggleModal('create-ticket-modal', false);
        
        // Scan and reload
        await probeTickets();
        renderTickets();
        renderStats();
    } catch (err) {
        showToast("Failed to create ticket: " + err.message, "error");
    }
}

async function handleEditTicketSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-ticket-id').value);
    const title = document.getElementById('edit-ticket-title').value;
    const description = document.getElementById('edit-ticket-description').value;
    const priority = document.getElementById('edit-ticket-priority').value;
    const status = document.getElementById('edit-ticket-status').value;
    
    try {
        await apiRequest(`/tickets/${id}`, 'PUT', { title, description, priority, status });
        showToast("Ticket updated successfully!", "success");
        toggleModal('edit-ticket-modal', false);
        
        await probeTickets();
        renderTickets();
        renderStats();
        
        // Update drawer if current active ticket was modified
        if (state.activeTicketId === id) {
            openTicketDrawer(id);
        }
    } catch (err) {
        showToast("Failed to edit ticket: " + err.message, "error");
    }
}

async function handleDeleteTicket(ticketId) {
    if (!confirm("Are you sure you want to delete this ticket and all its related content?")) return;
    
    try {
        const msg = await apiRequest(`/tickets/${ticketId}`, 'DELETE');
        showToast(msg, "success");
        closeTicketDrawer();
        
        await probeTickets();
        await probeComments(); // Comments are cascades deleted
        renderTickets();
        renderStats();
    } catch (err) {
        showToast("Failed to delete ticket: " + err.message, "error");
    }
}

async function handleStatusChange(ticketId, newStatus) {
    try {
        // Use PUT /tickets/{id} because the backend PATCH statusUpdate lacks a save() call
        await apiRequest(`/tickets/${ticketId}`, 'PUT', {
            title: "",
            description: "",
            priority: null,
            status: newStatus
        });
        showToast(`Status updated to ${newStatus.replace('_', ' ')}`, "success");
        
        await probeTickets();
        renderTickets();
        renderStats();
        
        if (state.activeTicketId === ticketId) {
            openTicketDrawer(ticketId);
        }
    } catch (err) {
        showToast("Failed to update status: " + err.message, "error");
    }
}

async function handleAgentReassign(ticketId, agentId) {
    try {
        if (!agentId) {
            showToast("Agent re-assignment requires choosing an agent.", "error");
            return;
        }
        await apiRequest(`/tickets/${ticketId}/assign/${agentId}`, 'PATCH');
        showToast("Agent assigned successfully!", "success");
        
        await probeTickets();
        renderTickets();
        
        if (state.activeTicketId === ticketId) {
            openTicketDrawer(ticketId);
        }
    } catch (err) {
        showToast("Failed to reassign agent: " + err.message, "error");
    }
}

async function handleAddComment(e) {
    e.preventDefault();
    if (!state.activeTicketId) return;
    
    const message = document.getElementById('comment-message').value;
    const userId = parseInt(document.getElementById('comment-user-select').value);
    
    if (!userId) {
        showToast("Please select a user to comment as.", "error");
        return;
    }
    
    try {
        await apiRequest('/comment/create', 'POST', {
            message,
            userId,
            ticketId: state.activeTicketId
        });
        
        document.getElementById('comment-message').value = '';
        await probeComments();
        renderCommentsList(state.activeTicketId);
    } catch (err) {
        showToast("Failed to post comment: " + err.message, "error");
    }
}

async function handleDeleteComment(e, commentId) {
    e.stopPropagation(); // Prevent drawer trigger
    if (!confirm("Delete this comment?")) return;
    
    try {
        const msg = await apiRequest(`/comment/delete/${commentId}`, 'DELETE');
        showToast(msg, "success");
        
        await probeComments();
        if (state.activeTicketId) {
            renderCommentsList(state.activeTicketId);
        }
    } catch (err) {
        showToast("Failed to delete comment: " + err.message, "error");
    }
}

function openEditTicketModal(ticketId) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    document.getElementById('edit-ticket-id').value = ticket.id;
    document.getElementById('edit-ticket-title').value = ticket.title;
    document.getElementById('edit-ticket-description').value = ticket.description;
    document.getElementById('edit-ticket-priority').value = ticket.priority;
    document.getElementById('edit-ticket-status').value = ticket.status;
    
    toggleModal('edit-ticket-modal', true);
}

// ==========================================
// Theme, Toast, and Utility Layer
// ==========================================
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle-btn');
    
    if (body.classList.contains('light-theme')) {
        body.classList.replace('light-theme', 'dark-theme');
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark-theme');
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light-theme');
    }
}

function loadInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    const body = document.body;
    const btn = document.getElementById('theme-toggle-btn');
    
    body.className = savedTheme;
    if (savedTheme === 'dark-theme') {
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function showToast(message, type = "info") {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msgEl = document.getElementById('toast-message');
    
    msgEl.textContent = message;
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    icon.className = 'fa-solid toast-icon';
    if (type === 'success') {
        icon.classList.add('fa-circle-check');
    } else if (type === 'error') {
        icon.classList.add('fa-triangle-exclamation');
    } else if (type === 'info') {
        icon.classList.add('fa-circle-info');
    }
    
    toast.classList.remove('hidden');
    
    // Hide after 4 seconds
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================
// Event Listeners Registration
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadInitialTheme();
    reloadAllData();
    
    // Form Submissions
    document.getElementById('create-user-form').addEventListener('submit', handleCreateUser);
    document.getElementById('create-ticket-form').addEventListener('submit', handleCreateTicket);
    document.getElementById('edit-ticket-form').addEventListener('submit', handleEditTicketSubmit);
    document.getElementById('post-comment-form').addEventListener('submit', handleAddComment);
    
    // Search and Filters
    document.getElementById('ticket-search').addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderTickets();
    });
    
    document.getElementById('filter-status').addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        renderTickets();
    });
    
    document.getElementById('filter-priority').addEventListener('change', (e) => {
        state.filters.priority = e.target.value;
        renderTickets();
    });
    
    // Active Acting User Select
    document.getElementById('acting-user-select').addEventListener('change', (e) => {
        state.actingUserId = parseInt(e.target.value) || null;
    });
    
    // Refresh Actions
    document.getElementById('refresh-users-btn').addEventListener('click', async () => {
        showToast("Scanning users database...", "info");
        await probeUsers();
        renderUserSelector();
        renderUsersList();
        populateDropdowns();
        showToast("Users directory updated!", "success");
    });
    
    document.getElementById('refresh-tickets-btn').addEventListener('click', async () => {
        showToast("Scanning tickets database...", "info");
        await probeTickets();
        renderTickets();
        renderStats();
        showToast("Tickets listing updated!", "success");
    });
    
    // Drawer Management Controls
    document.getElementById('drawer-status-select').addEventListener('change', (e) => {
        if (state.activeTicketId) {
            handleStatusChange(state.activeTicketId, e.target.value);
        }
    });
    
    document.getElementById('drawer-agent-select').addEventListener('change', (e) => {
        if (state.activeTicketId) {
            handleAgentReassign(state.activeTicketId, parseInt(e.target.value));
        }
    });
    
    document.getElementById('drawer-edit-btn').addEventListener('click', () => {
        if (state.activeTicketId) {
            openEditTicketModal(state.activeTicketId);
        }
    });
    
    document.getElementById('drawer-delete-btn').addEventListener('click', () => {
        if (state.activeTicketId) {
            handleDeleteTicket(state.activeTicketId);
        }
    });
    
    // Theme Toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    
    // Modal Openers & Closers
    document.getElementById('open-create-ticket-modal-btn').addEventListener('click', () => {
        if (state.users.length === 0) {
            showToast("You must register a User (and an Agent) before creating a ticket.", "error");
            return;
        }
        toggleModal('create-ticket-modal', true);
    });
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-backdrop');
            if (modal) modal.classList.add('hidden');
        });
    });
    
    document.getElementById('close-drawer-btn').addEventListener('click', closeTicketDrawer);
    
    // Close Drawer or Modal on clicking background
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            e.target.classList.add('hidden');
        }
        if (e.target.classList.contains('drawer-backdrop')) {
            closeTicketDrawer();
        }
    });
});
