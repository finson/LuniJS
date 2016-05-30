  /**
   * Define the status indicators that can be returned by a remote device driver.
   * The list is copied from C/Linux errno.h, except that we use the negative of
   * the value.
   *
   * The RAW object contains status code names, values and messages and is
   * preprocessed when the module is loaded.  Another object named
   * StatusCodes is created which is indexed with two keys: the
   * symbolic name and the numeric value. Either key can be used to retrieve a
   * descriptor object.
   *
   * Each descriptor object has three properties.
   *
   *       The 'sym' property is the name of the status code.
   *       The 'val' property is the numeric value of the status code.
   *       The 'msg' property is the explanatory text for the status code.
   *
   * Where there are two symbols with duplicate numeric values, I have chosen
   * to use only one of them to ensure that the sym <--> val mappings are
   * strictly one-to-one.
   */
  let RAW = {
      ESUCCESS : { val : 0, msg : "Success" },
      EPERM : { val : -1, msg : "Operation not permitted" },
      ENOENT : { val : -2, msg : "No such file or directory" },
      ESRCH : { val : -3, msg : "No such process" },
      EINTR : { val : -4, msg : "Interrupted system call" },
      EIO : { val : -5, msg : "I/O error" },
      ENXIO : { val : -6, msg : "No such device or address" },
      E2BIG : { val : -7, msg : "Argument list too long" },
      ENOEXEC : { val : -8, msg : "Exec format error" },
      EBADF : { val : -9, msg : "Bad file number" },
      ECHILD : { val : -10, msg : "No child processes" },
//      EAGAIN : { val : -11, msg : "Try again" },
      EWOULDBLOCK : { val : -11, msg : "Operation would block"},  // duplicate of EAGAIN
      ENOMEM : { val : -12, msg : "Out of memory" },
      EACCES : { val : -13, msg : "Permission denied" },
      EFAULT : { val : -14, msg : "Bad address" },
      ENOTBLK : { val : -15, msg : "Block device required" },
      EBUSY : { val : -16, msg : "Device or resource busy" },
      EEXIST : { val : -17, msg : "File exists" },
      EXDEV : { val : -18, msg : "Cross-device link" },
      ENODEV : { val : -19, msg : "No such device" },
      ENOTDIR : { val : -20, msg : "Not a directory" },
      EISDIR : { val : -21, msg : "Is a directory" },
      EINVAL : { val : -22, msg : "Invalid argument" },
      ENFILE : { val : -23, msg : "File table overflow" },
      EMFILE : { val : -24, msg : "Too many open files" },
      ENOTTY : { val : -25, msg : "Not a typewriter" },
      ETXTBSY : { val : -26, msg : "Text file busy" },
      EFBIG : { val : -27, msg : "File too large" },
      ENOSPC : { val : -28, msg : "No space left on device" },
      ESPIPE : { val : -29, msg : "Illegal seek" },
      EROFS : { val : -30, msg : "Read-only file system" },
      EMLINK : { val : -31, msg : "Too many links" },
      EPIPE : { val : -32, msg : "Broken pipe" },
      EDOM : { val : -33, msg : "Math argument out of domain of func" },
      ERANGE : { val : -34, msg : "Math result not representable" },
//      EDEADLK : { val : -35, msg : "Resource deadlock would occur" },
      EDEADLOCK : { val : -35, msg : "Resource deadlock would occur" },   // duplicate of EDEADLK
      ENAMETOOLONG : { val : -36, msg : "File name too long" },
      ENOLCK : { val : -37, msg : "No record locks available" },
      ENOSYS : { val : -38, msg : "Function not implemented at all" },
      ENOTEMPTY : { val : -39, msg : "Directory not empty" },
      ELOOP : { val : -40, msg : "Too many symbolic links encountered" },
      ENOMSG : { val : -42, msg : "No message of desired type" },
      EIDRM : { val : -43, msg : "Identifier removed" },
      ECHRNG : { val : -44, msg : "Channel number out of range" },
      EL2NSYNC : { val : -45, msg : "Level 2 not synchronized" },
      EL3HLT : { val : -46, msg : "Level 3 halted." },
      EL3RST : { val : -47, msg : "Level 3 reset" },
      ELNRNG : { val : -48, msg : "Link number out of range" },
      EUNATCH : { val : -49, msg : "Protocol driver not attached" },
      ENOCSI : { val : -50, msg : "No CSI structure available" },
      EL2HLT : { val : -51, msg : "Level 2 halted" },
      EBADE : { val : -52, msg : "Invalid exchange" },
      EBADR : { val : -53, msg : "Invalid request descriptor" },
      EXFULL : { val : -54, msg : "Exchange full" },
      ENOANO : { val : -55, msg : "No anode" },
      EBADRQC : { val : -56, msg : "Invalid request code" },
      EBADSLT : { val : -57, msg : "Invalid slot" },
      EBFONT : { val : -59, msg : "Bad font file format" },
      ENOSTR : { val : -60, msg : "Device not a stream" },
      ENODATA : { val : -61, msg : "No data available" },
      ETIME : { val : -62, msg : "Timer expired" },
      ENOSR : { val : -63, msg : "Out of streams resources" },
      ENONET : { val : -64, msg : "Machine is not on the network" },
      ENOPKG : { val : -65, msg : "Package not installed" },
      EREMOTE : { val : -66, msg : "Object is remote" },
      ENOLINK : { val : -67, msg : "Link has been severed" },
      EADV : { val : -68, msg : "Advertise error" },
      ESRMNT : { val : -69, msg : "Srmount error" },
      ECOMM : { val : -70, msg : "Communication error on send" },
      EPROTO : { val : -71, msg : "Protocol error" },
      EMULTIHOP : { val : -72, msg : "Multihop attempted" },
      EDOTDOT : { val : -73, msg : "RFS specific error" },
      EBADMSG : { val : -74, msg : "Not a data message" },
      EOVERFLOW : { val : -75, msg : "Value too large for defined data type" },
      ENOTUNIQ : { val : -76, msg : "Name not unique on network" },
      EBADFD : { val : -77, msg : "File descriptor in bad state" },
      EREMCHG : { val : -78, msg : "Remote address changed" },
      ELIBACC : { val : -79, msg : "Can not access a needed shared library" },
      ELIBBAD : { val : -80, msg : "Accessing a corrupted shared library" },
      ELIBSCN : { val : -81, msg : ".lib section in a.out corrupted" },
      ELIBMAX : { val : -82, msg : "Attempting to link in too many shared libraries" },
      ELIBEXEC : { val : -83, msg : "Cannot exec a shared library directly" },
      EILSEQ : { val : -84, msg : "Illegal byte sequence" },
      ERESTART : { val : -85, msg : "Interrupted system call should be restarted" },
      ESTRPIPE : { val : -86, msg : "Streams pipe error" },
      EUSERS : { val : -87, msg : "Too many users" },
      ENOTSOCK : { val : -88, msg : "Socket operation on non-socket" },
      EDESTADDRREQ : { val : -89, msg : "Destination address required" },
      EMSGSIZE : { val : -90, msg : "Message too long or too short" },
      EPROTOTYPE : { val : -91, msg : "Protocol wrong type for socket" },
      ENOPROTOOPT : { val : -92, msg : "Protocol not available" },
      EPROTONOSUPPORT : { val : -93, msg : "Protocol not supported" },
      ESOCKTNOSUPPORT : { val : -94, msg : "Socket type not supported" },
      EOPNOTSUPP : { val : -95, msg : "Operation not supported on transport endpoint" },
      EPFNOSUPPORT : { val : -96, msg : "Protocol family not supported" },
      EAFNOSUPPORT : { val : -97, msg : "Address family not supported by protocol" },
      EADDRINUSE : { val : -98, msg : "Address already in use" },
      EADDRNOTAVAIL : { val : -99, msg : "Cannot assign requested address" },
      ENETDOWN : { val : -100, msg : "Network is down" },
      ENETUNREACH : { val : -101, msg : "Network is unreachable" },
      ENETRESET : { val : -102, msg : "Network dropped connection because of reset" },
      ECONNABORTED : { val : -103, msg : "Software caused connection abort" },
      ECONNRESET : { val : -104, msg : "Connection reset by peer" },
      ENOBUFS : { val : -105, msg : "No buffer space available" },
      EISCONN : { val : -106, msg : "Transport endpoint is already connected" },
      ENOTCONN : { val : -107, msg : "Transport endpoint is not connected" },
      ESHUTDOWN : { val : -108, msg : "Cannot send after transport endpoint shutdown" },
      ETOOMANYREFS : { val : -109, msg : "Too many references: cannot splice" },
      ETIMEDOUT : { val : -110, msg : "Connection timed out" },
      ECONNREFUSED : { val : -111, msg : "Connection refused" },
      EHOSTDOWN : { val : -112, msg : "Host is down" },
      EHOSTUNREACH : { val : -113, msg : "No route to host" },
      EALREADY : { val : -114, msg : "Operation already in progress" },
      EINPROGRESS : { val : -115, msg : "Operation now in progress" },
      ESTALE : { val : -116, msg : "Stale NFS file handle" },
      EUCLEAN : { val : -117, msg : "Structure needs cleaning" },
      ENOTNAM : { val : -118, msg : "Not a XENIX named type file" },
      ENAVAIL : { val : -119, msg : "No XENIX semaphores available" },
      EISNAM : { val : -120, msg : "Is a named type file" },
      EREMOTEIO : { val : -121, msg : "Remote I/O error" },
      EDQUOT : { val : -122, msg : "Quota exceeded" },
      ENOMEDIUM : { val : -123, msg : "No medium found" },
      EMEDIUMTYPE : { val : -124, msg : "Wrong medium type" },
      ECANCELED : { val : -125, msg : "Operation Canceled" },
      ENOKEY : { val : -126, msg : "Required key not available" },
      EKEYEXPIRED : { val : -127, msg : "Key has expired" },
      EKEYREVOKED : { val : -128, msg : "Key has been revoked" },
      EKEYREJECTED : { val : -129, msg : "Key was rejected by service" },
      EOWNERDEAD : { val : -130, msg : "Owner died" },
      ENOTRECOVERABLE : { val : -131, msg : "State not recoverable" },

      // DeviceDriver status code additions

      ENOTSUP : { val : -150, msg : "Parameter values are valid, but the functionality they request is not available" },
      EPANIC : { val : -151, msg : "Executing code that was supposed to be unreachable." }
    };

    let StatusCodes = {};

    for (let s of Object.keys(RAW)) {
      StatusCodes[RAW[s].val] = {sym : s, val : RAW[s].val, msg : RAW[s].msg};
    }

    for (let s of Object.keys(RAW)) {
      StatusCodes[s] = {sym : s, val : RAW[s].val, msg : RAW[s].msg};
    }

  module.exports.SC = StatusCodes;
