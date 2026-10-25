(function (window) {
  function isTikTokProfile(entity = {}) {
    const platform = (entity.platform || "").toLowerCase();
    if (platform === "tiktok") return true;
    return (entity.cashtag || "").trim().startsWith("@");
  }

  function isCashAppProfile(entity = {}) {
    const platform = (entity.platform || "").toLowerCase();
    if (platform === "cashapp") return true;
    const avatar = entity.avatar || "";
    return (
      avatar.includes("/api/cashapp/avatar") ||
      avatar.includes("franklin-assets") ||
      avatar.includes("cash-images")
    );
  }

  function createUsernameSearch({
    contactListEl,
    typedRecipientContainer,
    getContacts,
    getTypedRecipientData,
    formatHandleForDisplay,
    renderContact,
    emptyResultsHtml = "",
    itemSelector = ".contact-item",
    displayStyle = "flex",
  }) {
    function renderContacts(contacts = getContacts()) {
      if (renderContact) {
        contactListEl.innerHTML = "";
        if (!contacts.length && emptyResultsHtml) {
          contactListEl.innerHTML = emptyResultsHtml;
          return;
        }
        contacts.forEach((contact) => {
          const item = renderContact(contact);
          item.dataset.name = (contact.name || "").toLowerCase();
          item.dataset.cashtag = (contact.cashtag || "").toLowerCase();
          contactListEl.appendChild(item);
        });
        return;
      }

      contactListEl.innerHTML = getContacts()
        .map((contact) => {
          const contactName = contact.name || "";
          const contactCashtag = contact.cashtag || "";
          const hasAvatarImage = Boolean(contact.avatar);
          const avatarUrl = String(contact.avatar || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "%22")
            .replace(/'/g, "%27")
            .replace(/</g, "%3C")
            .replace(/>/g, "%3E");
          const fallbackColor = contact.color || "#666666";
          const isTikTokContact = hasAvatarImage && isTikTokProfile(contact);
          const isCashAppContact = hasAvatarImage && isCashAppProfile(contact);
          const avatarStyles = hasAvatarImage
            ? isTikTokContact || isCashAppContact
              ? `background-image: url('${avatarUrl}'); background-size: cover; background-position: center; background-color: ${
                  isTikTokContact ? "#000000" : "#222222"
                };`
              : `background-image: url('${avatarUrl}'); background-size: 725%; background-position: center 22%;`
            : `background-color:${fallbackColor};`;
          const avatarContent = hasAvatarImage
            ? `<div class="avatar${
                isTikTokContact ? " avatar-tiktok" : ""
              }" style="${avatarStyles}" data-edit-id="${contact.id}"></div>`
            : `<div class="avatar" style="${avatarStyles}" data-edit-id="${
                contact.id
              }">${contact.initial || contactName.charAt(0)}</div>`;

          return `<div class="contact-item" data-id="${
            contact.id
          }" data-name="${contactName.toLowerCase()}" data-cashtag="${contactCashtag.toLowerCase()}"><div class="contact-details">${avatarContent}<div class="contact-info"><div class="contact-name">${
            contactName
          }</div><div class="contact-handle">${formatHandleForDisplay(
            contactCashtag
          )}</div></div></div><div class="checkbox"><i class="fa-solid fa-check"></i></div></div>`;
        })
        .join("");
    }

    function filterContactsOnInput(rawValue = "", useTikTokLookup = false) {
      const query = rawValue.toLowerCase().trim();
      const normalizedQuery = query.replace(/^[@$]/, "");

      if (useTikTokLookup) {
        let hasExactMatch = false;

        contactListEl.querySelectorAll(itemSelector).forEach((item) => {
          const name = item.dataset.name;
          const cashtag = item.dataset.cashtag.replace(/^[@$]/, "");
          if (name === normalizedQuery || cashtag === normalizedQuery) {
            hasExactMatch = true;
          }
          item.style.display = displayStyle;
        });

        const typedRecipientData =
          hasExactMatch && getTypedRecipientData && typedRecipientContainer
            ? getTypedRecipientData()
            : null;
        if (typedRecipientData) {
          const typedHandle = (typedRecipientData.cashtag || "").replace(
            /^[@$]/,
            ""
          );
          const typedName = (typedRecipientData.name || "").toLowerCase();

          contactListEl.querySelectorAll(itemSelector).forEach((item) => {
            const contactName = item.dataset.name;
            const contactHandle = item.dataset.cashtag.replace(/^[@$]/, "");
            if (contactName === typedName || contactHandle === typedHandle) {
              typedRecipientContainer.classList.add("hidden");
            }
          });
        }
        return;
      }

      if (query) {
        contactListEl.querySelectorAll(itemSelector).forEach((item) => {
          const name = item.dataset.name;
          const cashtag = item.dataset.cashtag;
          const normalizedCashtag = cashtag.replace(/^[@$]/, "");
          const matches =
            name.includes(normalizedQuery) ||
            normalizedCashtag.includes(normalizedQuery);
          item.style.display = matches ? displayStyle : "none";
        });

        if (typedRecipientContainer) {
          const hasMatchingContact = Array.from(contactListEl.querySelectorAll(itemSelector))
            .some((item) => item.style.display !== "none");
          if (hasMatchingContact) {
            typedRecipientContainer.classList.add("hidden");
          }
        }
        return;
      }

      contactListEl.querySelectorAll(itemSelector).forEach((item) => {
        item.style.display = displayStyle;
      });
    }

    function filterContacts(contacts, rawValue = "") {
      const query = rawValue.toLowerCase().trim().replace(/^[@$]/, "");
      if (!query) return contacts;
      return contacts.filter((contact) => {
        const name = (contact.name || "").toLowerCase();
        const cashtag = (contact.cashtag || "")
          .toLowerCase()
          .replace(/^[@$]/, "");
        return name.includes(query) || cashtag.includes(query);
      });
    }

    return { renderContacts, filterContacts, filterContactsOnInput };
  }

  window.UsernameSearch = {
    create: createUsernameSearch,
    isTikTokProfile,
    isCashAppProfile,
  };
})(window);
