package com.juaracoding.ITHelpdeskTicketing.security;

import java.util.function.Function;

public class BcryptImpl {

    private static final BcryptCustom bcrypt = new BcryptCustom(11);

    /** untuk
     * mengacak teks asli nya
     * @param password
     * @return
     */
    public static String hash(String password) {
        return bcrypt.hash(password);
    }

    public static boolean verifyAndUpdateHash(String password,
                                              String hash,
                                              Function<String, Boolean> updateFunc) {
        return bcrypt.verifyAndUpdateHash(password, hash, updateFunc);
    }

    /**
     * ini untuk membandingkan
     * teks asli dengan hash nya
     * @param password
     * @param hash
     * @return
     */
    public static boolean verifyHash(String password , String hash)
    {
        return bcrypt.verifyHash(password,hash);
    }
    public static void main(String[] args) {
        System.out.println(hash("admin.123Admin@123"));//imutable
        System.out.println(verifyHash("121314","$2a$11$TBHtMb0FBb0MQ4hwgL8lqOn396mxPiQr3xy7XmPsIirLmqTUUEKGm"));
    }
}