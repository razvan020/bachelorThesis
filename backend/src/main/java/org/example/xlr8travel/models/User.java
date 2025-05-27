package org.example.xlr8travel.models;
import lombok.*;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users") // Use "users" instead of "user" to avoid H2 reserved keyword issues
@ToString(exclude = {})
@Getter
@Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstname;
    private String lastname;
    private String username;
    private int age;
    private String gender; // enum?
    private String email;

    @Column(nullable = false)
    private String password;

    private LocalDate dob; // date of birth
    //  @Enumerated(EnumType.ORDINAL) // ?
    private Account_Status accountStatus; //

    // instead of @OneToMany when having collection of basic types or enums
    @ElementCollection(fetch = FetchType.EAGER)
    //private Set<String> roles = new HashSet<>();
    private List<Role> roles = new ArrayList<>(); // cand un user are mai multe roluri

    @Lob
    @Column(name = "profile_picture", columnDefinition = "BLOB")
    private byte[] profilePicture;

    @Column(name = "profile_picture_content_type", length = 50)
    private String profilePictureContentType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for(Role role : roles)
            authorities.add(new SimpleGrantedAuthority(role.toString()));
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public User(String firstname, String lastname, String username, int age, String gender, String email, String password, LocalDate dob, Account_Status accountStatus) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.age = age;
        this.gender = gender;
        this.email = email;
        this.password = password;
        this.dob = dob;
        this.accountStatus = accountStatus;
    }

    public User(String firstname, String lastname, String username, int age, String gender, String email, String password, LocalDate dob) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.age = age;
        this.gender = gender;
        this.email = email;
        this.password = password;
        this.dob = dob;
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public User(String username, String password, List<Role> roles) {
        this.username = username;
        this.password = password;
        this.roles = roles;
    }

    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
        if(email.equals("admin@gmail.com")){
            this.getRoles().add(Role.ROLE_ADMIN);
        }else {
            this.getRoles().add(Role.ROLE_USER);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return age == user.age && Objects.equals(firstname, user.firstname) && Objects.equals(lastname, user.lastname) && Objects.equals(username, user.username) && Objects.equals(gender, user.gender) && Objects.equals(email, user.email) && Objects.equals(password, user.password) && Objects.equals(dob, user.dob) && Objects.equals(roles, user.roles) && Objects.equals(accountStatus, user.accountStatus);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstname, lastname, username, age, gender, email, password, dob, roles, accountStatus);
    }

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Address> addresses = new HashSet<>();

    public void addAddress(Address address) {
        this.getAddresses().add(address);
        address.setUser(this);
    }


    @JsonBackReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Ticket> tickets = new HashSet<>();

    public void addTicket(Ticket ticket) {
        this.getTickets().add(ticket);
        ticket.setUser(this);
    }


   /* @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Payment> payments = new HashSet<>();

    public void addPayment(Payment payment) {
        this.getPayments().add(payment);
        payment.setUser(this);
    }

    public void setPayments(Set<Payment> payments) {
        this.payments = payments;
    }


    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private Set<Notification> notifications = new HashSet<>();

    public void addNotification(Notification notification) {
        this.getNotifications().add(notification);
        notification.setUser(this);
    }

    public void setNotifications(Set<Notification> notifications) {
        this.notifications = notifications;
    }*/
}
