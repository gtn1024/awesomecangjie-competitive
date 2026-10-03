---
oj: dmy
pid: '148'
title: '[R25A]小Z老师的拼数游戏0'
difficulty: 入门/普及−
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$a$ 的位数 $n$、$b$ 的位数 $m$ 满足 $1 \le n, m \le 100$，$a \ge 1$，$b \ge 0$，且 $a, b$ 均不含前导 $0$。

## 思路

由于 $a, b$ 的位数可达 $100$，远超任何整型范围，直接按**字符串**处理即可。整体就是一个纯模拟：

1. 把 $b$ 的字符序列反转，得到 $b'$；
2. 跳过 $b'$ 开头的所有前导 $0$（但要保留至少一个字符，即 $b = 0$ 时结果仍是 `"0"`）；
3. 把处理后的 $b'$ 拼到 $a$ 的末尾，输出拼接结果。

一个等价但更简洁的观察：跳过前导 $0$ 等价于「找到第一个非 $0$ 的位置开始截取；若全为 $0$ 则取最后一个 $0$」。这样只需一次线性扫描。

## 复杂度

时间 $O(n + m)$，空间 $O(n + m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let a = line[0]
    let b = line[1]

    // 将 b 翻转得到 b'，用字节列表处理
    let m = b.size
    var arr = Array<UInt8>(m, { _ => 0 })
    for (i in 0..m) {
        arr[m - 1 - i] = b[i]
    }

    // 去除前导 0（保留至少一个字符）
    var start: Int64 = 0
    while (start < m - 1 && arr[start] == 0x30u8) {
        start += 1
    }

    print(a)
    var j = start
    while (j < m) {
        print(Rune(UInt32(arr[j])))
        j += 1
    }
    println()
}
```

</details>
